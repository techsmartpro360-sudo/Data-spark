import { DataRow } from './types';

export function generateSampleCSV(): string {
  return `Name,Email,Phone,City,Age,Company,Signup_Date
JOHN SMITH,john.smith@gmial.com,1234567890,new york,28,Google,01/15/2024
jane doe,jane@yahoo.com,(555) 234-5678,Los Angeles,34,Microsoft,2024-02-20
  Bob Johnson  ,bob.j@hotmal.com,555.345.6789,chicago,45,Apple,March 3 2024
ALICE WILLIAMS,alice@gmail.com,5554567890,Houston,,Amazon,2024/04/10
john smith,john.smith@gmial.com,1234567890,New York,28,Google,01/15/2024
Charlie Brown,charlie@outlook.com,,San Francisco,31,Meta,2024-05-15
,,,,,, 
diana prince,diana@gmail.com,5556789012,Seattle,29,Netflix,06-20-2024
EDWARD NORTON,edward@yahooo.com,123,Boston,52,Tesla,2024-07-01
frank castle,frank@gmail.com,5557890123,  denver  ,,SpaceX,2024/08/12
Grace Lee,grace@gmail.com,5558901234,Portland,27,Adobe,2024-09-05
,,,,,, 
henry ford,henry@outlok.com,5559012345,Detroit,65,Ford,10/10/2024
IRIS WEST,iris@gmail.com,5550123456,Miami,33,Warner Bros,2024-11-20
jack ryan,jack@gmal.com,(555)1234567,Washington DC,,CIA Corp,2024-12-01
kate bishop,kate@gmail.com,5552345678,New York,24,Stark Industries,01-05-2025
LUKE CAGE,luke@gmail.com,5553456789,harlem,38,Heroes Inc,2025/02/14
mary jane,mj@gmail.com,5554567891,Queens,26,,2025-03-01
NICK FURY,nick@gmail.com,,Washington DC,55,SHIELD,2025-04-01
olivia pope,olivia@gmail.com,5556789013,Washington DC,42,OPA,2025/05/10`;
}

export function parseSampleData(): DataRow[] {
  const csv = generateSampleCSV();
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: DataRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() ?? '';
    });
    return row;
  });
}
