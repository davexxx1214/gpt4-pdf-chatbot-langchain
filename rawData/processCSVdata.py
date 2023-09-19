import csv
import argparse
import os

# Set up argument parser
parser = argparse.ArgumentParser(description='Extract specific rows and columns from a CSV file.')
parser.add_argument('input_file', help='The input CSV file.')
args = parser.parse_args()

input_file = args.input_file

# Generate output file name based on input file name
file_name, file_extension = os.path.splitext(input_file)
output_file = f"{file_name}_v2{file_extension}"

# Specify the desired row names
desired_row_names = ['U.S. Equity', 'Developed Markets Equity', 'Emerging Markets Equity','Cash','Other','U.S. Investment Grade','Extended Credit','Alternatives']

# Specify the desired column names
desired_column_names = ['Asset Class/ Investment', 'Current']

with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    header = next(reader)
    desired_column_indices = [i for i, col_name in enumerate(header) if col_name in desired_column_names]
    writer.writerow([header[i] for i in desired_column_indices])
    print(f"Processing header: {', '.join([header[i] for i in desired_column_indices])}")
    # Write the same header from the input file to the output file
    #writer.writerow(header)
    #print(f"Processing header: {', '.join(header)}")

    for row in reader:
        row_name = row[0]  # Assuming the row name is in the first column
        if row_name in desired_row_names:
            extracted_columns = [row[i] for i in desired_column_indices]
            writer.writerow(extracted_columns)
            print(f"Processing row '{row_name}': {', '.join(extracted_columns)}")

print("Processing complete. Output saved to:", output_file)