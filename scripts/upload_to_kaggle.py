#!/usr/bin/env python3
"""
FLAREX Kaggle Dataset & Benchmark Uploader
NTRO Problem Statement ID: 26162

This script automates uploading the 520-incident benchmark dataset and
reproducible CatBoost evaluation notebook to Kaggle.
"""

import os
import sys
import json
import subprocess

DATASET_DIR = os.path.abspath('kaggle_dataset')
METADATA_FILE = os.path.join(DATASET_DIR, 'dataset-metadata.json')

def load_kaggle_creds_from_env_local():
    """Try to load KAGGLE_USERNAME and KAGGLE_KEY from .env.local if present."""
    env_local_path = os.path.abspath('.env.local')
    if os.path.exists(env_local_path):
        with open(env_local_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k in ('KAGGLE_USERNAME', 'KAGGLE_KEY') and v:
                        os.environ[k] = v

def check_credentials():
    load_kaggle_creds_from_env_local()
    has_env = bool(os.environ.get('KAGGLE_USERNAME') and os.environ.get('KAGGLE_KEY'))
    kaggle_json = os.path.expanduser('~/.kaggle/kaggle.json')
    has_file = os.path.exists(kaggle_json)
    return has_env or has_file

def upload_dataset():
    if not check_credentials():
        print("=" * 70)
        print("⚠️  KAGGLE API TOKEN NOT DETECTED")
        print("=" * 70)
        print("To upload automatically via the Kaggle API:")
        print("1. Go to https://www.kaggle.com/settings")
        print("2. Under 'API', click 'Create New Token' to download kaggle.json")
        print("3. Place it at ~/.kaggle/kaggle.json OR set in your environment:")
        print("     export KAGGLE_USERNAME='your_username'")
        print("     export KAGGLE_KEY='your_api_key'")
        print("\nAlternatively, upload in 2 clicks via the Kaggle Web UI:")
        print(f"1. Open https://www.kaggle.com/datasets/new")
        print(f"2. Drag and drop the ready bundle:")
        print(f"   {os.path.abspath('kaggle_dataset/flarex_benchmark_dataset.zip')}")
        print("=" * 70)
        return False

    print("Authenticating with Kaggle API...")
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        print("Authentication successful!")

        # Check if dataset already exists
        with open(METADATA_FILE, 'r') as f:
            meta = json.load(f)
        dataset_id = meta.get('id')

        # Upload dataset
        print(f"Uploading dataset '{dataset_id}' from {DATASET_DIR}...")
        try:
            api.dataset_create_new(
                folder=DATASET_DIR,
                public=True,
                quiet=False
            )
            print(f"✅ Successfully created new Kaggle dataset: https://www.kaggle.com/datasets/{dataset_id}")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Dataset already exists. Pushing new version...")
                api.dataset_create_version(
                    folder=DATASET_DIR,
                    version_notes="Updated 520 verified incidents benchmark and leakage-free features",
                    quiet=False
                )
                print(f"✅ Successfully updated Kaggle dataset version: https://www.kaggle.com/datasets/{dataset_id}")
            else:
                raise e
        return True
    except Exception as err:
        print(f"Error during Kaggle upload: {err}")
        return False

if __name__ == '__main__':
    success = upload_dataset()
    sys.exit(0 if success else 1)
