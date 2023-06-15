## 1. Tải các thư viện cần thiết:

`npm install`

## 2. Chạy code để phát triển:

`npm run start`

Cổng web-server cấu hình trong file package.json:

`"start": "webpack serve --open --port 8181 --config webpack.dev.config.js"`

## 3. Build Production

+ Build App:

`npm run build`

+ Build Lib:

``npm run build-lib-for-browser``

``npm run build-lib-for-npm``

## 4. Check và fix lỗi style

Check lỗi:

`npm run eslint`

Fix tự động 1 số lỗi:

`npm run eslint -- --fix`

## 5. Cài extension cho VS Code để check và fix lỗi style, chất lượng code tự động:

#### 1. ESLint:

    + URL: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

    + Để check lỗi và hỗ trợ fix ngay trên IDE

#### 2. Prettier ESLint

    + URL: https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint

    + Để format code sử dụng gói prettier-eslint

    + Sau khi cài extension, tạo file: .vscode/settings.json
        {
            "editor.defaultFormatter": "rvest.vs-code-prettier-eslint",
            "editor.formatOnPaste": false, // required
            "editor.formatOnType": false, // required
            "editor.formatOnSave": true, // optional
            "editor.formatOnSaveMode": "file", // required to format on save
            "files.autoSave": "onFocusChange", // optional but recommended
            "vs-code-prettier-eslint.prettierLast": false // set as "true" to run 'prettier' last not first
        }

## 6. Một số file cấu hình sau đã được chuẩn hoá, cần lưu ý:

```
#để hỗ trợ IDE format code đúng chuẩn của Stringee
.editorconfig

#để ESLint check lỗi đúng chuẩn của Stringee
.eslintignore
.eslintrc.json

#để Prettier format đúng chuẩn của Stringee
.prettierignore
.prettierrc.json

#để không push lên git các file không cần thiết
.gitignore


#để VS Code chạy đúng thứ tự khi file code được save: Prettier => ESLint
.vscode/settings.json

#đã cấu hình sẵn các gói cần thiết cho dự án dùng webpack, có thể thay đổi tuy nhiên cần đảm bảo luôn sử dụng cả ESLint, Prettier
package.json
```
