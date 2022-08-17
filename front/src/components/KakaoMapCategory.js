import Division from "./Division";

var placeInfomation;

const { kakao } = window;
export default function KakaoMapCategory() {
  // 마커를 클릭했을 때 해당 장소의 상세정보를 보여줄 커스텀오버레이입니다
  var placeOverlay = new kakao.maps.CustomOverlay({ zIndex: 1 }),
    contentNode = document.createElement("div"), // 커스텀 오버레이의 컨텐츠 엘리먼트 입니다
    markers = [], // 마커를 담을 배열입니다
    currCategory = ""; // 현재 선택된 카테고리를 가지고 있을 변수입니다

  var mapContainer = document.getElementById("Map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(37.464, 126.803), // 지도의 중심좌표
      level: 4, // 지도의 확대 레벨
    };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);

  // 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 내 주소로 좌표를 검색합니다
geocoder.addressSearch('화곡동 351-89', function(result, status) {
// 정상적으로 검색이 완료됐으면 
  if (status === kakao.maps.services.Status.OK) {

    let coords = new kakao.maps.LatLng(result[0].y, result[0].x);

    // 결과값으로 받은 위치를 마커로 표시합니다
    let marker = new kakao.maps.Marker({
        map: map,
        position: coords
    });

    // 인포윈도우로 장소에 대한 설명을 표시합니다
    let infowindow = new kakao.maps.InfoWindow({
        content: '<div style="width:150px;text-align:center;padding:6px 0;">나의 위치</div>'
    });
    infowindow.open(map, marker);

    // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
    map.setCenter(coords);
}});
  // 장소 검색 객체를 생성합니다
  var ps = new kakao.maps.services.Places(map);

  // 지도에 idle 이벤트를 등록합니다
  kakao.maps.event.addListener(map, "idle", searchPlaces);

  // 커스텀 오버레이의 컨텐츠 노드에 css class를 추가합니다
  contentNode.className = "placeinfo_wrap";

  // 커스텀 오버레이의 컨텐츠 노드에 mousedown, touchstart 이벤트가 발생했을때
  // 지도 객체에 이벤트가 전달되지 않도록 이벤트 핸들러로 kakao.maps.event.preventMap 메소드를 등록합니다
  addEventHandle(contentNode, "mousedown", kakao.maps.event.preventMap);
  addEventHandle(contentNode, "touchstart", kakao.maps.event.preventMap);

  // 커스텀 오버레이 컨텐츠를 설정합니다
  placeOverlay.setContent(contentNode);

  // 각 카테고리에 클릭 이벤트를 등록합니다
  addCategoryClickEvent();

  // 엘리먼트에 이벤트 핸들러를 등록하는 함수입니다
  function addEventHandle(target, type, callback) {
    if (target.addEventListener) {
      target.addEventListener(type, callback);
    } else {
      target.attachEvent("on" + type, callback);
    }
  }

  // 카테고리 검색을 요청하는 함수입니다
  function searchPlaces() {
    if (!currCategory) {
      return;
    }

    // 커스텀 오버레이를 숨깁니다
    placeOverlay.setMap(null);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    ps.categorySearch(currCategory, placesSearchCB, { useMapBounds: true });
  }

  // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
  function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
      displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
    } else if (status === kakao.maps.services.Status.ERROR) {
      // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
    }
  }

  // 지도에 마커를 표출하는 함수입니다
  function displayPlaces(places) {
    console.log(places);
    // 몇번째 카테고리가 선택되어 있는지 얻어옵니다
    // 이 순서는 스프라이트 이미지에서의 위치를 계산하는데 사용됩니다
    var order = document
      .getElementById(currCategory)
      .getAttribute("data-order");

    for (var i = 0; i < places.length; i++) {
      // 마커를 생성하고 지도에 표시합니다
      var marker = addMarker(
        new kakao.maps.LatLng(places[i].y, places[i].x),
        order
      );

      // 마커와 검색결과 항목을 클릭 했을 때
      // 장소정보를 표출하도록 클릭 이벤트를 등록합니다
      (function (marker, place) {
        kakao.maps.event.addListener(marker, "click", function () {
          displayPlaceInfo(place);
          placeInfomation = place;
        });
      })(marker, places[i]);
    }
  }

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, order) {
    var imageSrc =
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png", // 마커 이미지 url, 스프라이트 이미지를 씁니다
      imageSize = new kakao.maps.Size(27, 28), // 마커 이미지의 크기
      imgOptions = {
        spriteSize: new kakao.maps.Size(72, 208), // 스프라이트 이미지의 크기
        spriteOrigin: new kakao.maps.Point(46, order * 36), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
        offset: new kakao.maps.Point(11, 28), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
      },
      markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
      marker = new kakao.maps.Marker({
        position: position, // 마커의 위치
        image: markerImage,
      });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker); // 배열에 생성된 마커를 추가합니다

    return marker;
  }

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다
  function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  function createContainer(id, name) {
    const container = document.createElement("div");
    container.className = "placeinfo";
    const a = document.createElement("a");
    a.id = id;
    a.className = "title";
    a.title = name;
    a.textContent = name;
    a.addEventListener('click', showPopup);
    container.appendChild(a);

    return container;
  }

  function showPopup() {
    const container = document.getElementById("Map");
    const board = document.createElement("div");
    const infomation = document.createElement("div");
    const infoTitle = document.createElement("p");
    const infoBody = document.createElement("div");
    const infoPhone = document.createElement("span");
    const infoAddress = document.createElement("span");
    const infoReview = document.createElement("div");
    const closeBtn = document.createElement("a");
    board.className = "mapBoard";
    board.addEventListener('click', closePupup);
    infomation.className = "infomation";
    infoTitle.className = "infoTitle";
    infoTitle.textContent = placeInfomation.place_name;
    infoBody.className = "infoBody";
    infoPhone.className = "infoPhone";
    infoPhone.textContent = placeInfomation.phone;
    infoAddress.className = "infoAddress";
    if(placeInfomation.road_address_name){
      infoAddress.textContent = placeInfomation.road_address_name;
    }else{
      infoAddress.textContent = placeInfomation.address_name;
    }
    infoReview.className = "infoReview";
    infoReview.textContent = "리뷰";
    closeBtn.className = "closePlaceInfo";
    closeBtn.href = "/";
    closeBtn.textContent = "X"
    closeBtn.addEventListener('click',event=>{event.preventDefault();closePupup();});
    console.log(placeInfomation);

    container.appendChild(board);
    container.appendChild(infomation);
    infomation.appendChild(infoTitle);
    infomation.appendChild(infoBody);
    infoTitle.appendChild(closeBtn);
    infoBody.appendChild(infoAddress);
    infoBody.appendChild(infoPhone);
    infoBody.appendChild(infoReview);
  }
  
  function closePupup() {
    const container = document.getElementById("Map");
    container.removeChild(container.lastChild);
    container.removeChild(container.lastChild);
  }

  function addAddress(container, addressName, roadAddressName) {
    if (roadAddressName) {
      const span = document.createElement("span");
      span.title = roadAddressName;
      span.textContent = roadAddressName;
      const jibun = document.createElement("span");
      jibun.className = "jibun";
      jibun.title = addressName;
      jibun.textContent = `(지번 : ${addressName})`;
      container.appendChild(span);
      container.appendChild(jibun);
    } else {
      const span = document.createElement("span");
      span.title = addressName;
      span.textContent = addressName;
      container.appendChild(span);
    }
    
    return container;
  }

  // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
  function displayPlaceInfo(place) {
    contentNode.innerHTML = '';
    const result = addAddress(
      createContainer(place.id, place.place_name),
      place.address_name,
      place.road_address_name
    );
    

    const tel = document.createElement('span');
    tel.className = 'tel';
    tel.textContent = place.phone;
    result.appendChild(tel);

    contentNode.appendChild(result);
    placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
    placeOverlay.setMap(map);

    // var content =
    //   '<div class="placeinfo">' +
    //   "<a id= " +
    //   place.id +
    //   '" class="title" title="' +
    //   place.place_name +
    //   '">' +
    //   place.place_name +
    //   "</a>";
    // if (place.road_address_name) {
    //   content +=
    //     '    <span title="' +
    //     place.road_address_name +
    //     '">' +
    //     place.road_address_name +
    //     "</span>" +
    //     '  <span class="jibun" title="' +
    //     place.address_name +
    //     '">(지번 : ' +
    //     place.address_name +
    //     ")</span>";
    // } else {
    //   content +=
    //     '    <span title="' +
    //     place.address_name +
    //     '">' +
    //     place.address_name +
    //     "</span>";
    // }

    // content +=
    //   '    <span class="tel">' +
    //   place.phone +
    //   "</span>" +
    //   "</div>" +
    //   '<div class="after"></div>';

    // contentNode.innerHTML = content;
    // placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
    // placeOverlay.setMap(map);
  }

  // 각 카테고리에 클릭 이벤트를 등록합니다
  function addCategoryClickEvent() {
    var category = document.getElementById("category"),
      children = category.children;

    for (var i = 0; i < children.length; i++) {
      children[i].onclick = onClickCategory;
    }
  }

  // 카테고리를 클릭했을 때 호출되는 함수입니다
  function onClickCategory() {
    var id = this.id,
      className = this.className;

    placeOverlay.setMap(null);

    if (className === "on") {
      currCategory = "";
      changeCategoryClass();
      removeMarker();
    } else {
      currCategory = id;
      changeCategoryClass(this);
      searchPlaces();
    }
  }

  // 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
  function changeCategoryClass(el) {
    var category = document.getElementById("category"),
      children = category.children,
      i;

    for (i = 0; i < children.length; i++) {
      children[i].className = "";
    }

    if (el) {
      el.className = "on";
    }
  }
}
