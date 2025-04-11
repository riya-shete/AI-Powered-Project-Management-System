import os
import glob

def extract_code_to_txt():
    # Define the base directory
    base_dir = r"c:\Users\patil\Desktop\PMS\AI-Powered-Project-Management-System"
    
    # Define the output file path
    output_file = os.path.join(base_dir, "code_extraction.txt")
    
    # Define the directories to search
    search_dirs = [
        os.path.join(base_dir, "backend"),
        os.path.join(base_dir, "backend", "api")
    ]
    
    # Open the output file
    with open(output_file, "w", encoding="utf-8") as out_f:
        # For each directory
        for search_dir in search_dirs:
            if os.path.exists(search_dir):
                # Find all .py files in the directory and its subdirectories
                py_files = glob.glob(os.path.join(search_dir, "**", "*.py"), recursive=True)
                
                for py_file in py_files:
                    # Get the relative path for display
                    rel_path = os.path.relpath(py_file, base_dir)
                    
                    # Write the file name as a header
                    out_f.write(f"{'=' * 80}\n")
                    out_f.write(f"FILE: {rel_path}\n")
                    out_f.write(f"{'=' * 80}\n\n")
                    
                    # Read and write the file contents
                    try:
                        with open(py_file, "r", encoding="utf-8") as in_f:
                            content = in_f.read()
                            out_f.write(content)
                            out_f.write("\n\n")
                    except Exception as e:
                        out_f.write(f"ERROR: Could not read file: {str(e)}\n\n")
            else:
                print(f"Directory not found: {search_dir}")
    
    print(f"Code extraction complete. Output saved to: {output_file}")

if __name__ == "__main__":
    extract_code_to_txt()