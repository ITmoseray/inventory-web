import gettext
import os

# Global variable for the translation function
_ = lambda s: s

def set_locale(lang_code):
    """
    Sets the application's locale for internationalization.
    """
    global _
    try:
        localedir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'locale')
        
        # Ensure the locale directory exists
        if not os.path.isdir(localedir):
            print(f"Locale directory not found: {localedir}")
            # Fallback to a dummy translation if locale directory is missing
            _ = lambda s: s
            return

        print(f"Setting locale to: {lang_code}, looking in {localedir}")
        
        # Bind the domain 'sms' (Student Management System) to the locale directory
        # This allows gettext to find 'sms.mo' files within locale/{lang_code}/LC_MESSAGES/
        translation = gettext.translation('sms', localedir=localedir, languages=[lang_code], fallback=True)
        translation.install()
        _ = translation.gettext
        print(f"Locale set to {lang_code} successfully.")
    except Exception as e:
        print(f"Error setting locale to {lang_code}: {e}")
        # Fallback to a dummy translation in case of any error
        _ = lambda s: s

# Set a default locale (e.g., English) when the application starts
# This can be overridden later by user settings
set_locale('en')

# Expose the translation function
def get_translator():
    """
    Returns the current translation function.
    """
    return _
