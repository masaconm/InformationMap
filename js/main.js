//2024/12/06

// Google Mapsの主要なオブジェクトを定義
let map, geocoder, infoWindow;
const addressMarkers = {}; // 地図上のアドレスごとのマーカー情報を保存

// 地図の初期化を行う関数
function initMap() {
  // 地図の表示エリアと初期設定を設定
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13, // 初期ズームレベル
    center: { lat: 35.63711, lng: 139.4465075 }, // 初期中心座標
  });

  geocoder = new google.maps.Geocoder(); // 住所を緯度経度に変換するオブジェクト
  infoWindow = new google.maps.InfoWindow(); // 情報ウィンドウを管理するオブジェクト

  // JSONファイルからデータを取得
  fetch("data/data.json")
    .then((response) => {
      // HTTPエラーをチェック
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // レスポンスをJSON形式で返す
    })
    .then((data) => {
      // データをカテゴリごとに分類
      const categories = categorizeData(data);
      // 各カテゴリごとにデータを処理
      Object.keys(categories).forEach((category) => {
        processData(categories[category], category);
      });
    })
    .catch((error) => console.error("Error loading data:", error)); // データ取得エラーを表示
}

// データをカテゴリごとに分類する関数
function categorizeData(data) {
  return data.reduce((acc, item) => {
    // 特定の情報に基づいてカテゴリを決定
    const category = item.info.includes("安全安心まちづくり情報")
      ? "category1"
      : "category2";

    if (!acc[category]) acc[category] = []; // 新しいカテゴリの場合は初期化
    acc[category].push(item); // アイテムを該当カテゴリに追加

    return acc;
  }, {});
}

// カテゴリごとのデータを処理する関数
function processData(data, category) {
  // データを日付順にソート（新しい順）
  const sortedData = data.sort(
    (a, b) => new Date(b["info-date"]) - new Date(a["info-date"])
  );

  sortedData.forEach((item) => {
    // 住所を緯度経度に変換
    geocoder.geocode({ address: item.address }, (results, status) => {
      if (status === "OK") {
        const location = results[0].geometry.location; // 緯度経度情報を取得
        const locationKey = `${location.lat()},${location.lng()}`; // 一意なキーとして使用

        // 同じ場所にマーカーがない場合、新しく作成
        if (!addressMarkers[locationKey]) {
          // 円の色を情報の内容に基づいて決定
          const circleColor = item.info.includes("多摩市からのお知らせ")
            ? "#0000FF"
            : "#FF0000";

          // 円を描画
          const circle = new google.maps.Circle({
            strokeColor: circleColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: circleColor,
            fillOpacity: 0.35,
            map: map,
            center: location,
            radius: 200, // 半径200メートル
          });

          // マーカーを作成
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            label: "1", // ラベルにアイテム数を表示
          });

          // マーカーと関連付けたデータを保存
          addressMarkers[locationKey] = {
            marker: marker,
            items: [item],
            circle: circle,
          };

          // マーカークリック時に情報ウィンドウを表示
          marker.addListener("click", () => {
            displayInfoWindow(addressMarkers[locationKey]);
          });

          // リストに項目を追加
          addListItem(item, location, marker, category);
        } else {
          // 既存のマーカーにアイテムを追加
          addressMarkers[locationKey].items.push(item);
          const marker = addressMarkers[locationKey].marker;
          marker.setLabel(`${addressMarkers[locationKey].items.length}`); // ラベルを更新
        }
      } else {
        console.error(
          `Geocoding failed for address ${item.address}: ${status}` // ジオコーディングエラーを表示
        );
      }
    });
  });
}

// リストにアイテムを追加する関数
function addListItem(item, location, marker, category) {
  const list = document.getElementById(category); // 該当カテゴリのリストを取得
  const listItem = document.createElement("div"); // 新しいリストアイテムを作成
  listItem.className = "list-item";
  listItem.innerHTML = `
    <div class="info-title-row">
      <p class="info-title">${item.info}</p>
    </div>
    <div class="info-date-row">
      <strong class="info-date">日時</strong> ${item.date}
    </div>
    <div class="info-address-row">
      <strong class="info-address">住所</strong> ${item.address}
    </div>
    <div class="info-content-row">
      <strong class="info-content">内容</strong> <div class="info-text">${
        item.content
      }</div>
    </div>
    <div class="info-suspect-row">
      <strong class="info-suspect">特徴</strong> <div class="info-text">${formatSuspectAsList(
        item.suspect
      )}</div>
    </div>
  `;

  // リストアイテムクリック時に地図を更新
  listItem.addEventListener("click", () => {
    map.setCenter(location); // 地図の中心を変更
    map.setZoom(16); // ズームレベルを変更
    const addressData = addressMarkers[`${location.lat()},${location.lng()}`];
    displayInfoWindow(addressData); // 情報ウィンドウを表示
  });

  list.appendChild(listItem); // リストに追加
}

// 特徴をリスト形式で整形する関数
function formatSuspectAsList(suspect) {
  const items = suspect.split("\n").filter(Boolean); // 改行で分割し、空行を除去
  const listItems = items.map((item) => `<li>${item}</li>`).join(""); // 各項目をリスト化
  return `<ul>${listItems}</ul>`;
}

// 情報ウィンドウを表示する関数
function displayInfoWindow(addressData) {
  const items = addressData.items;

  // カテゴリアイコンを設定
  const icon = items[0].info.includes("不審者情報")
    ? "img/caution-icon.png"
    : "img/animal-icon.png";

  // アイコンのHTMLを生成
  let iconDisplay = `
    <div style="text-align: center; margin-bottom: 10px;">
      <img src="${icon}" alt="カテゴリアイコン" style="width: 32px; height: 32px;">
    </div>
  `;

  // タブと内容のHTMLを生成
  let tabs = `<div style="display: flex; border-bottom: 1px solid #3878c7;">`;
  let contents = `<div class="info-window-content">`;

  items.forEach((item, index) => {
    tabs += `
      <button id="tab-${index}" class="tab-btn" style="flex: 1; padding: 5px; border: none; background: ${
      index === 0 ? "#0c294c" : "white"
    }; color: ${
      index === 0 ? "white" : "black"
    };" onclick="switchTabContent(${index}, ${items.length})">
        ${index + 1}
      </button>
    `;

    contents += `
      <div id="content-${index}" style="display: ${
      index === 0 ? "block" : "none"
    };">
        <div class="info-title-row">
          <p class="info-title">${item.info}</p>
        </div>
        <div class="info-date-row">
          <strong class="info-date">日時</strong> ${item.date}
        </div>
        <div class="info-address-row">
          <strong class="info-address">住所</strong> ${item.address}
        </div>
        <div class="info-content-row">
          <strong class="info-content">内容</strong> <div class="info-text">${
            item.content
          }</div>
        </div>
        <div class="info-suspect-row">
          <strong class="info-suspect">特徴</strong> <div class="info-text">${formatSuspectAsList(
            item.suspect
          )}</div>
        </div>
      </div>
    `;
  });

  tabs += `</div>`;
  contents += `</div>`;

  // 情報ウィンドウに内容を設定
  infoWindow.setContent(`<div>${iconDisplay}${tabs}${contents}</div>`);
  infoWindow.open(map, addressData.marker); // 情報ウィンドウを開く
}

// タブの切り替えを管理する関数
function switchTabContent(index, totalTabs) {
  const contents = document.querySelectorAll(`[id^="content-"]`); // コンテンツの取得
  const tabs = document.querySelectorAll(`[id^="tab-"]`); // タブボタンの取得

  contents.forEach((content, i) => {
    content.style.display = i === index ? "block" : "none"; // 表示/非表示を切り替え
  });

  tabs.forEach((tab, i) => {
    tab.style.background = i === index ? "#0c294c" : "white"; // 背景色を切り替え
    tab.style.color = i === index ? "white" : "black"; // テキスト色を切り替え
  });
}

// カテゴリタブの切り替えを管理する関数
function switchTab(category) {
  document.querySelectorAll(".list-category").forEach((list) => {
    list.style.display = "none"; // すべて非表示にする
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active"); // アクティブクラスを削除
  });

  document.getElementById(category).style.display = "block"; // 選択したカテゴリを表示
  document
    .querySelector(`button[onclick="switchTab('${category}')"]`)
    .classList.add("active"); // 選択タブをアクティブにする
}

// 地図の初期化をwindowオブジェクトに設定
window.initMap = initMap;
