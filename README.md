# rethinkdb-import
A node-based RethinkDB JSON importer because the one built in is broken.

## Documentation

Simply run the command `node .` in a terminal pointed to the folder containing the repo files and follow the instructions.

You need to have an existing table and database set up in order to use this program - it will not erase any data currently in a table.

Takes in a JSON file with an array of objects, similar to what RethinkDB's cursor.toArray function outputs. Here's an example:

```json
[
  {
    "name": "Harry Potter and the Philosopher's Stone",
    "author": "J.K. Rowling"
  },
  {
    "name": "Harry Potter and the Chamber of Secrets",
    "author": "J.K. Rowling"
  }
]
```
