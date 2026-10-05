#!/usr/bin/env python
"""
DreamStorage - Root Django CLI Execution Entrypoint
Allows executing Django commands directly from project root:
  python manage.py runserver
  python manage.py migrate
  python manage.py seed_data
"""
import os
import sys
from pathlib import Path

# Add api directory to sys.path so Django apps are discoverable
BASE_DIR = Path(__file__).resolve().parent
API_DIR = BASE_DIR / 'api'
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dreamstorage_core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
