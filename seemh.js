var base_url = 'http://tw.seemh.com/comic/';
var page = require('webpage').create();
var nPages = -1;

function getComics(id, callback) {
  var comic_base_url = base_url + id;

  page.open(comic_base_url, function (status) {
    var book_title = page.evaluate(function() {
        var title = document.querySelector('.book-title');
        return title.innerText;
    });

    var volumes = page.evaluate(function() {
        var elems = document.querySelectorAll('a.status0');
        var volumes = [];
        for(var i=0;i<elems.length;i++) {
            var filename = elems[i].href.match(/([^\/]+)(?=\.\w+$)/)[0];
            volumes.push({title:elems[i].title, vid:filename});
        }
        return volumes;
    });

    volumes = JSON.parse(JSON.stringify(volumes));
    if(callback) {
      callback(book_title, volumes);
    }
  });
}

function getVolume(id, vid, page_id, next) {
  var url = base_url;
  url+=id + '/';
  url+=vid;
  if(page_id!=-1) {
      url+="_p"+page_id;
  }
  url+=".html";

  //console.log(url);
  page.open(url, function (status) {
    //console.log(url);
    if(page_id == -1) {
       nPages = page.evaluate(function() {
          return document.getElementById('pageSelect').length;
       });
    }

    if(page_id==-1) {
        page_id=1;
    }

    if(page_id == 0) {
       if(next && next.length > 0) {
         var v = next.shift();
         console.log('cd ..');
         console.log("mkdir " + v.title);
         console.log("cd " + v.title);
         getVolume(id, v.vid, -1, next);
       } else {
         phantom.exit();
       }
       return;
    }

    var img = page.evaluate(function() {
        return document.getElementById('mangaFile').src;
    });

    var ext = img.substr(img.lastIndexOf('.'));
    console.log('curl -g -o ' + ('000000'+page_id).slice(-7) + ext + ' "' + img +'"');
    getVolume(id, vid, nPages--,next);
  });
}

getComics(6563, function(book_title, volumes) {
  console.log("mkdir " + book_title);
  console.log("cd " + book_title);

  var v = volumes.shift();
  console.log("mkdir " + v.title);
  console.log("cd " + v.title);
  getVolume(6563, v.vid, -1, volumes);

  //phantom.exit();
});
