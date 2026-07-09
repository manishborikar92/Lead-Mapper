import { parse } from 'csv-parse';
import { AppError } from '../../shared/middlewares/error.middleware';

export class CsvService {
  /**
   * Safe CSV parser supporting irregular columns, trailing spaces, and empty cells.
   */
  public async parse(bufferOrString: Buffer | string): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      parse(
        bufferOrString,
        {
          columns: true,               // Use the first row as headers (object keys)
          skip_empty_lines: true,      // Omit completely empty lines
          trim: true,                  // Trim spaces around headers and cell values
          relax_column_count: true,    // Prevent failures on rows with mismatched column counts
          cast: false                  // Return everything as strings, let AI do conversions
        },
        (err, output) => {
          if (err) {
            console.error('[ERROR] [CSV_PARSER] - Failed to parse CSV:', err.message);
            reject(new AppError(`CSV Parsing Failed: ${err.message}`, 400));
          } else {
            resolve(output as Record<string, any>[]);
          }
        }
      );
    });
  }
}
