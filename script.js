// Aplicacao para votar no craque do Racha da Paz

var TEMP_DATA = [
  {
    name: 'Emanuel',
    stars: 2,
    avatar: 'https://i.pinimg.com/236x/14/6a/df/146adffe9b1e9793d60862f0367a0214--create-your-own-avatar-avatar-maker.jpg'
  },
  {
    name: 'Galeno',
    stars: 0,
    avatar: 'https://i.pinimg.com/236x/70/b7/e1/70b7e1a1eeccc1e9508be5b633ef11cc.jpg'
  },
  {
    name: 'Anderson',
    stars: 1,
    avatar: 'https://pickaface.net/assets/images/slides/slide2.png'
  }
];

var currentMemberIdx = -1;
var CHECK = "/images/estrela_cheia.png";
var UNCHECK = "/images/estrela_vazia.png";

var starsDiv = document.getElementsByClassName('estrelas')[0];
var stars = starsDiv.getElementsByTagName('img');

var checkStars = function(indexClicked) {
  if (indexClicked < 0) {
    return;
  }
  Array.prototype.slice.call(stars).forEach(function(star, index) {
    star.src = index <= indexClicked ? CHECK : UNCHECK;
  });
}

var configureStars = function() {
  Array.prototype.slice.call(stars).forEach(function(star, index) {
    star.onclick = function() {
      checkStars(index)
    };
  });
}

var changeMemberTo = function(who) {
  if ( (currentMemberIdx >= TEMP_DATA.size - 1) && currentMemberIdx <= 0 ) {
    return;
  }

  if (who === 'next') {
    currentMemberIdx++;
  } else {
    currentMemberIdx--;
  }

  var member = TEMP_DATA[currentMemberIdx];

  document.getElementById('avatar').src = member.avatar;
  document.getElementById('label').textContent = member.name;
  checkStars(member.stars-1);
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
  configureNavigation();
  configureStars();
  changeMemberTo('next');
}

init();


// var oReq = new XMLHttpRequest();
// oReq.onload = reqListener;
// oReq.open("get", "yourFile.txt", true);
// oReq.send();