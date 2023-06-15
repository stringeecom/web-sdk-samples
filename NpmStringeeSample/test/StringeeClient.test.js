import StringeeClient from "../src/StringeeClient";
// const StringeeClient = require("../src/StringeeClient");


// eslint-disable-next-line max-len
const accessToken = "eyJjdHkiOiJzdHJpbmdlZS1hcGk7dj0xIiwidHlwIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJqdGkiOiJTS3FTdDZPZFRra0tqOXUwSzBLMzA3WlhpS2E5RW5Qb1VjLTE2ODAzNDQyNzIiLCJpc3MiOiJTS3FTdDZPZFRra0tqOXUwSzBLMzA3WlhpS2E5RW5Qb1VjIiwiZXhwIjoxNjgwNDMwNjcyLCJ1c2VySWQiOiJhY19ibHhtYnBsdmt4YXJ2cWpwIiwiaWNjX2FwaSI6dHJ1ZSwiY2hhdEFnZW50Ijp0cnVlLCJkaXNwbGF5TmFtZSI6Ilx1MDExMFx1MWVhZHUgTmdcdTFlY2RjIEh1eSIsImF2YXRhclVybCI6Imh0dHBzOlwvXC9hcGkuc3RyaW5nZWV4LmNvbVwvdjFcL2N1c3RvbWl6ZXJcL2F2YXRhclwvYWNfYmx4bWJwbHZreGFydnFqcFwvTk1VTUhRU0hCTi0xNjY5NDE3NjUxNjU4LmpwZWciLCJzdWJzY3JpYmUiOiJvbmxpbmVfc3RhdHVzX0dSWUo2RElBLEFMTF9DQUxMX1NUQVRVUyxhZ2VudF9tYW51YWxfc3RhdHVzIiwiYXR0cmlidXRlcyI6Ilt7XCJhdHRyaWJ1dGVcIjpcIm9ubGluZVN0YXR1c1wiLFwidG9waWNcIjpcIm9ubGluZV9zdGF0dXNfR1JZSjZESUFcIn0se1wiYXR0cmlidXRlXCI6XCJjYWxsXCIsXCJ0b3BpY1wiOlwiY2FsbF9HUllKNkRJQVwifV0ifQ.eHWeKfhde3aB7O-txuqO4NhemALjUVDUR8O_DWM8GvY";

const apiStringeeBaseUrl = null;

// ham delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// connect to StringeeServer
const stringeeClient = new StringeeClient([], apiStringeeBaseUrl);
stringeeClient
    .connect(accessToken)
    .then(function() {
        console.log("Connected");
    })
    .catch(function(e) {
        console.log("======error: ", e);
    });


// cho 2s de ket noi den StringeeServer thanh cong, sau do kiem tra status, neu = 1 la OK
// neu khac 1 la co loi
it("works with async/await", async () => {
    await delay(2000);
    console.log("stringeeClient.socket.status: " + stringeeClient.socket.readyState);
    await delay(2000);
    expect(
        stringeeClient.socket.readyState
    ).toBe(1);// stringeeClient.socket.readyState = 1 la OPEN
});


