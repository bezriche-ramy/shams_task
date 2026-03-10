# Google Sheets Setup

## Tabs to create

Create these two tabs in your spreadsheet:

- `Users`
- `Tasks`

## Paste this into `Users`

Copy the contents of `sheet-templates/Users.csv` into the `Users` tab.

```csv
ID,Name,Email,Password,Role,Team
```

## Paste this into `Tasks`

Copy the contents of `sheet-templates/Tasks.csv` into the `Tasks` tab.

```csv
TaskID,Title,Description,AssignedTo,Team,Status,CreatedDate,DueDate
```

## Supported values

### Role

- `Admin`
- `User`

### Team

- `Frontend`
- `Backend`
- `Database`
- `Docs`
- `UI/UX`

### Status

- `Pending`
- `In Progress`
- `Completed`
- `Blocked`

## Secure first admin

Use `scripts/setup-google-sheet.ts` to create the first admin user with a hashed password instead of pasting a plain password into the sheet manually.
