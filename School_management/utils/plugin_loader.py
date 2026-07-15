import importlib.util
import os
import sys

from plugins.base_plugin import BasePlugin

PLUGIN_DIR = "plugins"

class PluginLoader:
    def __init__(self, app_instance):
        self.app_instance = app_instance
        self.loaded_plugins = []
        self.plugin_dir_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", PLUGIN_DIR)
        
        # Add plugin directory to Python path
        if self.plugin_dir_path not in sys.path:
            sys.path.insert(0, self.plugin_dir_path)

    def load_plugins(self):
        print(f"Scanning for plugins in: {self.plugin_dir_path}")
        if not os.path.exists(self.plugin_dir_path):
            print(f"Plugin directory not found: {self.plugin_dir_path}")
            return

        for entry_name in os.listdir(self.plugin_dir_path):
            entry_path = os.path.join(self.plugin_dir_path, entry_name)

            if os.path.isdir(entry_path) and not entry_name.startswith("__"): # Consider subdirectories as potential plugins
                plugin_module_name = entry_name
                plugin_file_path = os.path.join(entry_path, f"{entry_name}.py") # Assume plugin main file is plugin_name.py

                if not os.path.exists(plugin_file_path):
                    print(f"Skipping directory {entry_name}: No main plugin file '{entry_name}.py' found.")
                    continue
            elif os.path.isfile(entry_path) and entry_name.endswith(".py") and not entry_name.startswith("__"):
                plugin_module_name = entry_name[:-3] # Remove .py extension
                plugin_file_path = entry_path
            else:
                continue # Skip other files/directories

            print(f"Attempting to load plugin: {plugin_module_name} from {plugin_file_path}")
            try:
                spec = importlib.util.spec_from_file_location(plugin_module_name, plugin_file_path)
                if spec is None:
                    print(f"Could not get spec for {plugin_module_name}")
                    continue

                module = importlib.util.module_from_spec(spec)
                sys.modules[plugin_module_name] = module
                spec.loader.exec_module(module)

                for name in dir(module):
                    obj = getattr(module, name)
                    if isinstance(obj, type) and issubclass(obj, BasePlugin) and obj is not BasePlugin:
                        plugin_instance = obj()
                        plugin_instance.initialize(self.app_instance)
                        self.loaded_plugins.append(plugin_instance)
                        print(f"Successfully loaded plugin: {plugin_instance.get_name()}")
                        break # Assume one plugin class per file/directory
            except Exception as e:
                print(f"Error loading plugin {plugin_module_name}: {e}")

    def get_loaded_plugins(self):
        return self.loaded_plugins
