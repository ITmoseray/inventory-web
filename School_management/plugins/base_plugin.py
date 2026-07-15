class BasePlugin:
    def __init__(self):
        pass

    def initialize(self, app_instance):
        """
        Called when the plugin is loaded.
        :param app_instance: The main application instance (e.g., Dashboard).
        """
        raise NotImplementedError("Plugins must implement the initialize method.")

    def get_name(self):
        """
        Returns the display name of the plugin.
        """
        raise NotImplementedError("Plugins must implement the get_name method.")

    def get_menu_items(self):
        """
        Returns a list of menu items the plugin wants to add to the main application.
        Each item should be a tuple: (display_text, command_function).
        """
        return [] # Plugins can optionally add menu items.
