"use client";

import { subscribeUser } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPush() {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    throw new Error("Push notifications not supported on this browser.");
  }

  const registration = await navigator.serviceWorker.ready;
  
  // Get active subscription
  let subscription = await registration.pushManager.getSubscription();

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error("VAPID Public Key not configured on the client.");
  }

  if (!subscription) {
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
  }

  // Parse subscription details
  const subJSON = subscription.toJSON();
  if (!subJSON.endpoint || !subJSON.keys?.auth || !subJSON.keys?.p256dh) {
    throw new Error("Subscription missing endpoint or key metadata.");
  }

  // Register on backend database
  const res = await subscribeUser({
    endpoint: subJSON.endpoint,
    keys: {
      auth: subJSON.keys.auth,
      p256dh: subJSON.keys.p256dh
    }
  });

  if (!res.success) {
    throw new Error(res.error || "Failed to store subscription on server.");
  }

  return true;
}
