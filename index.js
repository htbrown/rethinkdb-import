/* 
    [ rethinkdb-import ]
    Hayden Brown (htbrown.com)
    See LICENSE file for licencing information.
*/

const r = require('rethinkdb'),
    Journl = require('journl'),
    clear = require('clear-screen'),
    input = require('input'),
    config = require('./config.js'),
    fs = require('fs');

const arguments = process.argv.slice(2);

const log = new Journl({
    layout: '%type_short%  %message%'
});

let db = {}
let filePath, importTable, data;

const init = async () => {
    clear();

    log.info('rethinkdb-import');
    log.info('An unofficial way to import data into RethinkDB.');
    log.warn('Please refer to the documentation (https://github.com/htbrown/rethinkdb-import) for instructions and an example of a valid JSON format.');
    console.log();

    db.name = await input.text('Enter database name:');
    await r.connect({
        db: db.name,
        host: config.rethinkdb.ip || 'localhost',
        port: config.rethinkdb.port || '28015'
    }, (err, conn) => {
        if (err) {
            log.error('Something went wrong while connecting to RethinkDB. Maybe the details aren\'t correct? For more information, run the program with the --debug argument.');
            if (arguments.includes('--debug')) console.log(err.stack);
            process.exit();
        } else {
            db.conn = conn;
        }
    })
    if (!(await r.dbList().run(db.conn)).includes(db.name)) {
        log.error('Database given does not exist.')
        process.exit();
    } else {
        log.info(`Using ${db.name} database.`)
    }

    filePath = await input.text('Enter JSON file path:');
    if (!fs.existsSync(filePath)) {
        log.error('File does not exist.')
        process.exit();
    } else {
        log.info(`Using "${filePath}".`)
        try {
            data = require(filePath);
        } catch (err) {
            log.error('Something went wrong importing the given file. Make sure you\'ve included the proper file path (including ./ if the file is in the current directory). For more information, run the program with the --debug argument.');
            if (arguments.includes('--debug')) console.log(err.stack);
            process.exit();
        }
    }

    let existingTables = await r.tableList().run(db.conn);

    if (existingTables.length > 1) {
        importTable = await input.select('Select table to import to:', existingTables);
        log.info(`Importing to ${importTable}.`)
    } else {
        importTable = existingTables[0];
        log.info(`Importing to ${importTable}.`)
    }

    importData();
}

const importData = async () => {
    clear();
    log.warn('Please check that the parameters below are correct before continuing.');
    log.info('Importing data will not remove existing data in the table.');

    console.log(`Importing to table ${importTable} in database ${db.name}`);
    console.log(`Importing data from file path: ${filePath}`);
    console.log();

    let confirm = await input.confirm('Are you sure you would like to continue?');

    if (!confirm) {
        log.info('Exiting...');
        process.exit();
    } else {
        for (let i in data) {
            r.table(importTable).insert(data[i]).run(db.conn, (err) => {
                if (err) {
                    log.error(`Something went wrong while inserting record ${i}. For more information, run the program with the --debug argument.`);
                    if (arguments.includes('--debug')) console.log(err.stack);
                    process.exit();        
                }
            });
            log.success(`Inserted record ${i + 1}.`)
        }
    }

    log.success('Done.')
    process.exit();
}

init();