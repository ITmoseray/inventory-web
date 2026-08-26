"use server";

import { prisma as globalPrisma, getTenantPrisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Ensures default #general channel exists for the business
 */
async function ensureDefaultChannel(businessId: string, userId: string) {
  const existing = await globalPrisma.teamConversation.findFirst({
    where: {
      businessId,
      type: "CHANNEL",
      title: "#general"
    }
  });

  if (!existing) {
    const generalChannel = await globalPrisma.teamConversation.create({
      data: {
        businessId,
        type: "CHANNEL",
        title: "#general",
        description: "Company-wide general announcements and team chat.",
        lastMessagePreview: "Welcome to the team chat!",
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderId: userId,
            content: "👋 Welcome to Protech Assist Enterprise Team Chat! Staff and Admins can share updates, ask questions, and collaborate here in real time."
          }
        },
        members: {
          create: {
            userId,
            lastReadAt: new Date()
          }
        }
      }
    });
    return generalChannel;
  }
  return existing;
}

/**
 * Returns all active conversations (Channels and Direct Messages) for the current user
 */
export async function getConversations() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { conversations: [], error: "Unauthorized" };
    }

    const businessId = session.user.businessId;
    const userId = session.user.id;

    // Ensure default general channel exists
    await ensureDefaultChannel(businessId, userId);

    // Auto-join user to public channels if not already joined
    const publicChannels = await globalPrisma.teamConversation.findMany({
      where: {
        businessId,
        type: "CHANNEL",
        members: {
          none: { userId }
        }
      }
    });

    for (const channel of publicChannels) {
      try {
        await globalPrisma.conversationMember.create({
          data: {
            conversationId: channel.id,
            userId,
            lastReadAt: new Date()
          }
        });
      } catch (e) {}
    }

    // Fetch all user conversations
    const conversations = await globalPrisma.teamConversation.findMany({
      where: {
        businessId,
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                imageUrl: true,
                isOnline: true,
                lastActiveAt: true,
                role: { select: { name: true } }
              }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: [
        { lastMessageAt: "desc" },
        { createdAt: "desc" }
      ]
    });

    const threshold = new Date(Date.now() - 3 * 60 * 1000);

    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const myMembership = c.members.find((m) => m.userId === userId);
        const lastRead = myMembership?.lastReadAt || new Date(0);

        // Count unread messages
        const unreadCount = await globalPrisma.chatMessage.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            createdAt: { gt: lastRead }
          }
        });

        // Determine title and partner for DMs
        let displayTitle = c.title || "Direct Message";
        let displayAvatar: string | null = null;
        let isPartnerOnline = false;
        let partnerRole = "";
        let partnerEmail = "";

        if (c.type === "DIRECT") {
          const partnerMember = c.members.find((m) => m.userId !== userId);
          if (partnerMember?.user) {
            displayTitle = partnerMember.user.name || partnerMember.user.username || partnerMember.user.email;
            displayAvatar = partnerMember.user.imageUrl;
            partnerRole = partnerMember.user.role?.name || "Staff";
            partnerEmail = partnerMember.user.email;
            isPartnerOnline = partnerMember.user.lastActiveAt
              ? new Date(partnerMember.user.lastActiveAt) >= threshold
              : false;
          }
        }

        return {
          id: c.id,
          type: c.type,
          title: displayTitle,
          description: c.description,
          displayAvatar,
          isPartnerOnline,
          partnerRole,
          partnerEmail,
          unreadCount,
          lastMessagePreview: c.lastMessagePreview,
          lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : c.createdAt.toISOString(),
          membersCount: c.members.length,
          members: c.members.map((m) => ({
            id: m.user.id,
            name: m.user.name || m.user.username || "User",
            email: m.user.email,
            role: m.user.role?.name || "Staff",
            isOnline: m.user.lastActiveAt ? new Date(m.user.lastActiveAt) >= threshold : false,
            imageUrl: m.user.imageUrl
          }))
        };
      })
    );

    return { conversations: formatted };
  } catch (err: any) {
    console.error("getConversations error:", err);
    return { conversations: [], error: err.message || "Failed to load conversations." };
  }
}

/**
 * Returns messages for a conversation and marks messages as read for current user
 */
export async function getConversationMessages(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { messages: [], error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Fetch conversation details
    const conversation = await globalPrisma.teamConversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                imageUrl: true,
                role: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return { messages: [], error: "Conversation not found" };
    }

    // Update lastReadAt for current user
    try {
      await globalPrisma.conversationMember.upsert({
        where: {
          conversationId_userId: { conversationId, userId }
        },
        update: { lastReadAt: new Date() },
        create: { conversationId, userId, lastReadAt: new Date() }
      });
    } catch (e) {}

    // Load recent 100 messages
    const messages = await globalPrisma.chatMessage.findMany({
      where: { conversationId, deletedAt: null },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            imageUrl: true,
            role: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take: 100
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === userId,
      sender: {
        id: m.sender.id,
        name: m.sender.name || m.sender.username || "Team Member",
        email: m.sender.email,
        role: m.sender.role?.name || "Staff",
        imageUrl: m.sender.imageUrl
      }
    }));

    return { messages: formatted, conversation };
  } catch (err: any) {
    console.error("getConversationMessages error:", err);
    return { messages: [], error: err.message || "Failed to load messages." };
  }
}

/**
 * Sends a message in a conversation
 */
export async function sendChatMessage(data: {
  conversationId: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const cleanContent = (data.content || "").trim();

    if (!cleanContent && !data.attachmentUrl) {
      return { success: false, error: "Message cannot be empty." };
    }

    // Create the message
    const message = await globalPrisma.chatMessage.create({
      data: {
        conversationId: data.conversationId,
        senderId: userId,
        content: cleanContent,
        attachmentUrl: data.attachmentUrl || null,
        attachmentType: data.attachmentType || null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            imageUrl: true,
            role: { select: { name: true } }
          }
        }
      }
    });

    // Update conversation last message timestamp & preview
    const preview = cleanContent.length > 60 ? cleanContent.substring(0, 57) + "..." : cleanContent;
    await globalPrisma.teamConversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview || "Sent an attachment"
      }
    });

    // Update sender's lastReadAt
    await globalPrisma.conversationMember.updateMany({
      where: { conversationId: data.conversationId, userId },
      data: { lastReadAt: new Date() }
    });

    revalidatePath("/dashboard/chat");

    return {
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        attachmentUrl: message.attachmentUrl,
        attachmentType: message.attachmentType,
        createdAt: message.createdAt.toISOString(),
        isMine: true,
        sender: {
          id: message.sender.id,
          name: message.sender.name || message.sender.username || "You",
          email: message.sender.email,
          role: message.sender.role?.name || "Staff",
          imageUrl: message.sender.imageUrl
        }
      }
    };
  } catch (err: any) {
    console.error("sendChatMessage error:", err);
    return { success: false, error: err.message || "Failed to send message." };
  }
}

/**
 * Finds or creates a 1-on-1 direct message conversation with another user
 */
export async function getOrCreateDirectConversation(targetUserId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { conversationId: null, error: "Unauthorized" };
    }

    const businessId = session.user.businessId;
    const userId = session.user.id;

    if (userId === targetUserId) {
      return { conversationId: null, error: "Cannot create a direct message with yourself." };
    }

    // Find existing direct conversation between these 2 users in this business
    const existing = await globalPrisma.teamConversation.findFirst({
      where: {
        businessId,
        type: "DIRECT",
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: targetUserId } } }
        ]
      }
    });

    if (existing) {
      return { conversationId: existing.id };
    }

    // Target user info
    const targetUser = await globalPrisma.user.findUnique({
      where: { id: targetUserId },
      select: { name: true, email: true }
    });

    // Create new direct conversation
    const newConv = await globalPrisma.teamConversation.create({
      data: {
        businessId,
        type: "DIRECT",
        title: targetUser?.name || targetUser?.email || "Direct Chat",
        members: {
          create: [
            { userId, lastReadAt: new Date() },
            { userId: targetUserId, lastReadAt: new Date(0) }
          ]
        }
      }
    });

    revalidatePath("/dashboard/chat");
    return { conversationId: newConv.id };
  } catch (err: any) {
    console.error("getOrCreateDirectConversation error:", err);
    return { conversationId: null, error: err.message || "Failed to open conversation." };
  }
}

/**
 * Returns team directory with live presence for quick-starting chats
 */
export async function getTeamDirectory() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { members: [], error: "Unauthorized" };
    }

    const businessId = session.user.businessId;
    const currentUserId = session.user.id;
    const threshold = new Date(Date.now() - 3 * 60 * 1000);

    const users = await globalPrisma.user.findMany({
      where: {
        businessId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        department: true,
        jobTitle: true,
        imageUrl: true,
        lastActiveAt: true,
        role: { select: { name: true } }
      },
      orderBy: [
        { lastActiveAt: "desc" },
        { name: "asc" }
      ]
    });

    const formatted = users.map((u) => {
      const isOnline = u.lastActiveAt ? new Date(u.lastActiveAt) >= threshold : false;
      return {
        id: u.id,
        name: u.name || u.username || u.email,
        email: u.email,
        phone: u.phone,
        department: u.department,
        jobTitle: u.jobTitle,
        imageUrl: u.imageUrl,
        role: u.role?.name || "Staff",
        isOnline,
        isMe: u.id === currentUserId
      };
    });

    return { members: formatted };
  } catch (err: any) {
    console.error("getTeamDirectory error:", err);
    return { members: [], error: err.message || "Failed to load team directory." };
  }
}

/**
 * Returns total unread messages count for the logged-in user
 */
export async function getUnreadChatCount() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { count: 0 };
    }

    const businessId = session.user.businessId;
    const userId = session.user.id;

    const myMemberships = await globalPrisma.conversationMember.findMany({
      where: {
        userId,
        conversation: { businessId }
      },
      select: {
        conversationId: true,
        lastReadAt: true
      }
    });

    let totalUnread = 0;

    for (const membership of myMemberships) {
      const lastRead = membership.lastReadAt || new Date(0);
      const unreadInConv = await globalPrisma.chatMessage.count({
        where: {
          conversationId: membership.conversationId,
          senderId: { not: userId },
          createdAt: { gt: lastRead },
          deletedAt: null
        }
      });
      totalUnread += unreadInConv;
    }

    return { count: totalUnread };
  } catch (err: any) {
    return { count: 0 };
  }
}

/**
 * Creates a new custom team channel
 */
export async function createTeamChannel(data: {
  title: string;
  description?: string;
  memberUserIds?: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.businessId) {
      return { success: false, error: "Unauthorized" };
    }

    const businessId = session.user.businessId;
    const userId = session.user.id;

    let cleanTitle = data.title.trim();
    if (!cleanTitle.startsWith("#")) cleanTitle = "#" + cleanTitle;

    // Check if channel name exists
    const existing = await globalPrisma.teamConversation.findFirst({
      where: { businessId, title: cleanTitle }
    });

    if (existing) {
      return { success: false, error: "A channel with this name already exists." };
    }

    const allMemberIds = Array.from(new Set([userId, ...(data.memberUserIds || [])]));

    const newChannel = await globalPrisma.teamConversation.create({
      data: {
        businessId,
        type: "CHANNEL",
        title: cleanTitle,
        description: data.description || null,
        lastMessagePreview: "Channel created",
        lastMessageAt: new Date(),
        members: {
          create: allMemberIds.map((mid) => ({
            userId: mid,
            lastReadAt: mid === userId ? new Date() : new Date(0)
          }))
        },
        messages: {
          create: {
            senderId: userId,
            content: `📢 Channel ${cleanTitle} created. Start collaborating!`
          }
        }
      }
    });

    revalidatePath("/dashboard/chat");
    return { success: true, channelId: newChannel.id };
  } catch (err: any) {
    console.error("createTeamChannel error:", err);
    return { success: false, error: err.message || "Failed to create channel." };
  }
}
