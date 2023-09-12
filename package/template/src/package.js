const  scripts = {
  "install": "crw install",
  "start": "crw start",
  "build": "crw build"
}

console.log(!Object.values(scripts).some(scripts => {
  console.log(scripts.split(' '));
  return scripts.split(' ').includes('crw')
}));
