#!/usr/bin/env node
import { existsSync, readdirSync, mkdirSync, cpSync } from 'fs';

function copyDir(src: string, dest: string) {
  const folders = src.split('/');
  const destDir = dest + '/' + folders[folders.length - 2];
  if (!existsSync(destDir)) {
    mkdirSync(destDir);
  }
  cpSync(src, destDir, { recursive: true });
}

function gatherorgSqls() {
  const [, , ...args] = process.argv;
  const projectRootDir = args[0] ?? process.cwd();

  if (existsSync(projectRootDir)) {
    copyFromLibs(projectRootDir);
  } else {
    console.log(`directory ${projectRootDir} not found!`);
  }
}

function copyFromLibs(projectRootDir: string) {
  const codeDirs = ['/libs/', '/apps/'];
  let getDirectories: string[] = [];

  codeDirs.forEach((element) => {
    const currentDir = projectRootDir + element;
    if (existsSync(currentDir)) {
      const directories = getSubDirs(currentDir);
      const sqlDirs = getSqlSubDirs(directories);
      getDirectories = getDirectories.concat(sqlDirs);
    }
  });

  copyDirsToTempDir(projectRootDir, getDirectories);
}

function copyFromNodeModules(projectRootDir: string) {
  const orgLibDir = '/node_modules/@lib/';
  let getDirectories: string[] = [];
  const currentDir = projectRootDir + orgLibDir;

  if (existsSync(currentDir)) {
    const directories = getSubDirs(currentDir);
    const sqlDirs = getSqlSubDirs(directories);
    copyDirsToTempDir(projectRootDir, sqlDirs);
  }
}

function getSubDirs(dir: string) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dir + dirent.name + '/');
}

function getSqlSubDirs(dirs: string[]) {
  let sqlDirs: string[] = [];
  dirs.forEach((directory) => {
    sqlDirs = sqlDirs.concat(
      readdirSync(directory, {
        withFileTypes: true,
      })
        .filter((dirent) => dirent.isDirectory())
        .filter((dname) => dname.name === 'sql')
        .map((dirent) => directory + dirent.name)
    );
    // console.log('sqlDirs are ' + subDirs);
  });
  return sqlDirs;
}

function copyDirsToTempDir(projectRootDir: string, dirs: string[]) {
  const tempDir = projectRootDir + '/.sql';

  if (!existsSync(tempDir)) {
    mkdirSync(tempDir);
  }

  dirs.forEach((directory) => {
    copyDir(directory, tempDir);
  });
}

gatherorgSqls();
