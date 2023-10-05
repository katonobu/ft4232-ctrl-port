# ft4232-ctrl-port
- [LiveDemo](https://katonobu.github.io/ft4232-ctrl-port/)
## プロジェクト初期化
- [参考情報](https://note.com/shift_tech/n/n9c5fcd207680)

### 手順
```
npm create vite@latest ft4232-ctrl-port -- --template react-ts 
cd ft4232-ctrl-port
npm install
npm install @katonobu/js-serial-web
npm install --save-dev @types/w3c-web-serial @types/web
```

### 実装
- [参考情報](https://reffect.co.jp/html/toggle-switch/)

### git-hub pageへのデプロイ
- .npmrcをgithub-action側で再現させる
  - npm installの前に、.npmrcを作る
    - secretの値をcatさせることでアクセスキーを安全に扱える
- 白いページになる
  - Failed to load resource: the server responded with a status of 404 ()
    - `https://katonobu.github.io/ft4232-ctrl-port/assets/index-05da87e1.js`から取ってくるべきところを`https://katonobu.github.io/assets/index-05da87e1.js`から取ってきている。
  - [vite.config.jsのbaseを修正する](https://qiita.com/tat_mae084/items/4051c61926dc8165e80b#31-viteconfigjs%E3%82%92%E7%B7%A8%E9%9B%86)
  - [参考情報](https://github.com/sitek94/vite-deploy-demo)



