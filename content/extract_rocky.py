"""
extract_rocky.py
Extracts all sections of the Project Hail Mary transcript that contain ROCKY.
Sections are delimited by lines of 16 underscores (________________).
Output is written to rocky_sections.txt in the same directory.
"""

import os

SEPARATOR = "________________"
INPUT_FILE = os.path.join(os.path.dirname(__file__), "Movie Transcript - Project Hail Mary .txt")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "rocky_sections.txt")


def main():
    with open(INPUT_FILE, encoding="utf-8") as f:
        content = f.read()

    # Split on the separator line (strip each section of leading/trailing whitespace)
    raw_sections = content.split(SEPARATOR)

    rocky_sections = [s for s in raw_sections if "ROCKY" in s]

    if not rocky_sections:
        print("No sections containing ROCKY were found.")
        return

    output = (f"\n{SEPARATOR}\n").join(rocky_sections)

    # Wrap with separators so the file looks like the original format
    output = SEPARATOR + "\n" + output + "\n" + SEPARATOR

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"Done. {len(rocky_sections)} section(s) containing ROCKY written to:")
    print(f"  {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
