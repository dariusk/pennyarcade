/* global sharing */
var nouns = [],
    verbs = [],
    title = '',
    lastGabe = '';

Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

function generate(tycho, gabe) {
  function nextRhyme(words, i) {
    console.log(words[i],i);
    getRhyme(words[i]).then(function(rhymes) {
      results[words[i]] = rhymes;
      i++;
      if (i < words.length) {
        nextRhyme(words, i);
      }
      else {
        console.log(results);
        var result = _.chain(results)
          .pairs()
          .reject(function(v) {return v[1] === '';})
          .value()
          .pick();
        console.log(result);
        if (result) {
          var newtitle = title.replace(result[0],result[1].humanize());
          var tycho = title + '? More like ' + newtitle + ', amirite?';
          $('#tycho').text(tycho);
          var gabe = badwords.pick().replace(/[aeiou]/,'*').humanize()+'.';
          while (gabe === lastGabe) {
            gabe = badwords.pick().replace(/[aeiou]/,'*').humanize()+'.';
          }
          lastGabe = gabe;
          $('#gabe').text(gabe);
          var shareUrl = window.location.href.split('?')[0]+'?word='+sharing.encodeStr(tycho)+'$'+sharing.encodeStr(gabe);
          $('#share').attr('href', shareUrl);
          $('.twitter-share-button').remove();
          $('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="Penny Arcade Strip Generator #gennyArcade" data-lang="en">Tweet</a>');
          if (twttr.widgets) {
            twttr.widgets.load();
          }
        }
        else {
          generate();
        }
      }
    });
  }
  var results = {};
  //$('#content').html(generatedText);
  getGame().then(function(name) {
    console.log(name);
    title = name;
    // remove everything but spaces and a-z letters
    name = name.replace(/[^a-zA-Z ]+/,'');
    var words = name.trim().split(' ');
    var i = 0;
    nextRhyme(words, i);
  });
}

function getGame() {
  var dfd = new $.Deferred();
  $.getJSON('http://pipes.yahoo.com/pipes/pipe.run?_id=0f847cb10135ce170755ff18539130e9&_render=json&_callback=?', function(data) {
    var games = data.value.items;
    var data = games.pick();
    var name = data.content.replace(/\(.*\)/,'').trim();
    var href = data.href;
    dfd.resolve(name);
  });
  return dfd.promise();
}

function getRhyme(word) {
  var deferred = new $.Deferred();
  $.getJSON('http://api.wordnik.com/v4/word.json/' + word.toLowerCase() + '/relatedWords?useCanonical=false&relationshipTypes=rhyme&limitPerRelationshipType=100&api_key=d4711e36506fe047f12970c6fdc0b43f6e4fef2e855e03d5c&callback=?', function(data) {
    var result = '';
    if (data.length > 0) {
      result = data[0].words.pick();
    }
    deferred.resolve(result);
  });
  return deferred.promise();
}

$('#generate').click(function() { generate(); });
if (sharing.gup('word') === '') {
  generate();
}
else {
  var tycho = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[0]).titleize().replace('Like','like').replace('Amirite','amirite');
  var gabe = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[1]).humanize();
  console.log(tycho, gabe);
  $('#tycho').text(tycho);
  $('#gabe').text(gabe);
  var shareUrl = window.location.href.split('?')[0]+'?word='+sharing.encodeStr(tycho)+'$'+sharing.encodeStr(gabe);
  $('#share').attr('href', shareUrl);
  $('.twitter-share-button').remove();
  $('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="Penny Arcade Strip Generator #gennyArcade" data-lang="en">Tweet</a>');
  if (twttr.widgets) {
    twttr.widgets.load();
  }

}
