// Aplicacao para votar no craque do Racha da Paz

// var TEMP_DATA = [
//   {
//     name: 'Emanuel',
//     stars: 2,
//     avatar: 'https://i.pinimg.com/236x/14/6a/df/146adffe9b1e9793d60862f0367a0214--create-your-own-avatar-avatar-maker.jpg'
//   },
//   {
//     name: 'Galeno',
//     stars: 0,
//     avatar: 'https://i.pinimg.com/236x/70/b7/e1/70b7e1a1eeccc1e9508be5b633ef11cc.jpg'
//   },
//   {
//     name: 'Anderson',
//     stars: 1,
//     avatar: 'https://pickaface.net/assets/images/slides/slide2.png'
//   }
// ];

var DB = (function() {
  var done = false;
  var pollings = null;
  var game = null;
  var players = null;
  var currentUserId = null;
  var remoteDB = firebase.database().ref();

  var loadPoolings = function() {
    var uri = 'pollings/' + game.id + "-" + currentUserId;
    remoteDB.child(uri).once("value", function(snapshot) {
      pollings = snapshot.toJSON() || [];
      done = true;
    });
  }

  var loadPlayers = function() {
    remoteDB.child('players').once('value').then(function(snapshot) {
      players = Object.values(snapshot.toJSON());
      loadPoolings();
    });
  }

  var loadGame = function() {
    remoteDB.child('games').orderByKey().limitToLast(1).once("value", function(snapshot) {
      var games = Object.values(snapshot.toJSON());
      if (games.length > 0) {
        game = games[0];
        loadPlayers();
      } else {
        throw "Nao existe jogo cadastrado!";
      }
    });
  }

  var loadCurrentUser = function() {
    currentUserId = document.cookie.replace(/(?:(?:^|.*;\s*)craque-do-racha-user\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (currentUserId) {
      console.log("current user: " + currentUserId);
      loadGame();
    } else {
      var oReq = new XMLHttpRequest();
      oReq.onload = function() {
        var guid = JSON.parse(this.response).guid[0];
        document.cookie = "craque-do-racha-user=" + guid;
        console.log("current user: " + guid);
        currentUserId = guid;
        loadGame();
      };
      oReq.open("get", "https://helloacm.com/api/guid-generator/", true);
      oReq.send();
    }
  }

  var savePolling = function(rate, memberId) {
    console.log("Salvando voto...");
    var uri = 'pollings/' + game.id + "-" + currentUserId + "/" + memberId;
    var currentPolling = pollings[memberId] || { rate: 0 };
    currentPolling.rate = rate;
    remoteDB.child(uri).set(currentPolling);
  }

  var checkIfIsDone = function(successCallback) {
    if (done) {
      successCallback();
    } else {
      setTimeout(function() { checkIfIsDone(successCallback) }, 500);
    }
  }

  return {
    loadData: function(successCallback) {
      loadCurrentUser();
      checkIfIsDone(successCallback);
    },
    getPlayers: function() {
      return players;
    },
    getPollings: function() {
      return pollings;
    },
    getGame: function() {
      return game;
    },
    getVotesByPlayerId: function(id) {
      var polling = pollings[id] || { rate: 0 };
      return polling.rate;
    },
    saveVote: savePolling
  }
})();

var currentPlayerIdx = 0;
var CHECK = document.baseURI + "images/estrela_cheia.png";
var UNCHECK = document.baseURI + "images/estrela_vazia.png";

var starsDiv = document.getElementsByClassName('estrelas')[0];
var stars = starsDiv.getElementsByTagName('img');

var checkStars = function(indexClicked) {
  Array.prototype.slice.call(stars).forEach(function(star, index) {
    star.src = index <= indexClicked ? CHECK : UNCHECK;
  });
}

var configureStars = function() {
  Array.prototype.slice.call(stars).forEach(function(star, index) {
    star.onclick = function() {
      checkStars(index);
      var player = DB.getPlayers()[currentPlayerIdx];
      DB.saveVote(index + 1, player.id);
    };
  });
}

var changeMemberTo = function(who) {
  var next = document.getElementById('next');
  var previous = document.getElementById('previous');
  var nextIdx = currentPlayerIdx;

  if (who === 'next') {
    nextIdx = currentPlayerIdx + 1;
  } else if (who === 'previous'){
    nextIdx = currentPlayerIdx - 1;
  }

  if (nextIdx < 0 || nextIdx > DB.getPlayers().length - 1) {
    return;
  }

  if (nextIdx == DB.getPlayers().length - 1) {
    next.style.opacity = 0.1;
    previous.style.opacity = 1;
  } else if (nextIdx == 0) {
    previous.style.opacity = 0.1;
    next.style.opacity = 1;
  } else {
    previous.style.opacity = 1;
    next.style.opacity = 1;
  }

  currentPlayerIdx = nextIdx;
  var player = DB.getPlayers()[currentPlayerIdx];
  var rate = DB.getVotesByPlayerId(player.id);

  document.getElementById('avatar').src = document.baseURI + "images/players/" + player.id + ".jpeg";
  document.getElementById('label').textContent = player.name;
  checkStars(rate - 1);
}

var configureNavigation = function() {
  var previous = document.getElementById('previous');
  var next = document.getElementById('next');
  previous.onclick = function() {
    changeMemberTo('previous');
  };
  next.onclick = function() {
    changeMemberTo('next');
  };
}

var init = function() {
  DB.loadData(function success() {
    document.getElementById('title-text').textContent = "Racha do dia " + DB.getGame().date;
    configureNavigation();
    configureStars();
    changeMemberTo('current');
  });
}

init();
