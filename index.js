#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sha = require('sha');
const glob = require('glob');
const program = require('commander');

program
  .version('0.1.0')
  .arguments('<dir> [dirs...]')
  .option('-d, --dry-run', 'Dry run, just print file names.')
  .option('-f, --force', 'Delete duplicate files.')
  .action(function (dir, dirs) {
     dirValues = [dir];
     if (dirs) {
       dirValues = dirValues.concat(dirs);
     }
     target = dirValues.pop();
  });

program.parse(process.argv);

if ( (typeof dirValues === 'undefined') || (dirValues.length < 1) ) {
   console.error('no dir[s] given!');
   process.exit(1);
}

// console.log( dirValues );
// console.log( target );


const main = async function({dir,target}){

  const files = glob.sync( "**/*", {realpath:true, nodir:true, cwd:dir} )


  .filter(i=>fs.statSync(i).isFile() ) // strip dot files
  .map( i => ({ // create object
    location:i,
    name: sha.getSync(i) + path.extname(i)
  }))


  files.forEach(entry => {

    const oldName = entry.location;
    const newName = path.join( target, entry.name );

    if( oldName !== newName ) {

      if(program.dryRun){
        console.log( "move: %s\n  to: %s\n", oldName, newName )
      }else{
        fs.renameSync( oldName, newName );
      }

    }else{
      if(program.force) fs.unlink( oldName );
    }

  });

} // main


dirValues.map(dir=>main({dir,target}))
