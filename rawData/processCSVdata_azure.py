import csv
import argparse
from io import StringIO
import os
from azure.storage.fileshare import ShareServiceClient, ShareDirectoryClient, ShareFileClient

def process_model_data(input_data):
    # Specify the desired row names
    desired_row_names = ['U.S. Equity', 'Developed Markets Equity', 'Emerging Markets Equity','Cash','Other','U.S. Investment Grade','Extended Credit','Alternatives']

    # Specify the desired column names
    desired_column_names = ['Asset Class/ Investment', 'Current']


    # Read the input data
    input_file = StringIO(input_data.decode())
	# Generate output file name based on input file name
    file_name, file_extension = os.path.splitext(input_file)
    #output_file = f"{file_name}_v2{file_extension}"
    reader = csv.reader(input_file)

    # Prepare the output data
    output_file = StringIO()
    writer = csv.writer(output_file)
    header = next(reader)
    desired_column_indices = [i for i, col_name in enumerate(header) if col_name in desired_column_names]
    writer.writerow([header[i] for i in desired_column_indices])
    print(f"Processing header: {', '.join([header[i] for i in desired_column_indices])}")
    for row in reader:
        row_name = row[0]  # Assuming the row name is in the first column
        if row_name in desired_row_names:
            extracted_columns = [row[i] for i in desired_column_indices]
            writer.writerow(extracted_columns)
            print(f"Processing row '{row_name}': {', '.join(extracted_columns)}")

	# Get the output data
    output_data = output_file.getvalue().encode()
    output_file.close()

    return output_data


def main():
    # Replace these values with your account information
    connection_string = "your_connection_string"
    share_name = "your_share_name"
    input_directory_path = "path/to/input"
    output_directory_path = "path/to/output"

    # List all files in the input location
    share_service_client = ShareServiceClient.from_connection_string(connection_string)
    share_client = share_service_client.get_share_client(share_name)
    input_directory_client = share_client.get_directory_client(input_directory_path)

    file_list = list(input_directory_client.list_files_and_directories())

    # Process each file in the input location
    for file_item in file_list:
        input_file_path = f"{input_directory_path}/{file_item.name}"
        output_file_path = f"{output_directory_path}/{file_item.name}"
        # Read the input file from Azure File Storage
        input_file_client = share_client.get_file_client(input_file_path)
        input_data = input_file_client.download_file().readall()
		
        # Process the input data and generate the output data
        output_data = process_model_data(input_data)
		
		
        # Write the output file to Azure File Storage
        output_file_client = share_client.get_file_client(output_file_path)
        output_file_client.upload_file(output_data)

if __name__ == "__main__":
    main()
