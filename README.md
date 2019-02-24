# Mancala game

Play the Mancala game against _a computer_ **/** _an other player_ in a local network. 

## Setup

> Docker build below

Install [Node](https://nodejs.org/) or [Yarn](https://yarnpkg.com/). 
```sh
npm install # or | yarn install
```

After installing the dependencies, the app will be built and bundled automatically. If the post install step failed, you'd have to build and bundle the source manually:
```sh
npm run build # or | yarn build
```

Hereafter, enter the following script to serve the application locally:
```sh
npm start # or | yarn start
```

### Containerized

Besides local installation, you may run a container of the accompanied Dockerfile

```sh
docker build -t mancala_app . 
docker run -it --rm -p 8080:8080 mancala_app
```

Once the server (or container) is up and running, navigate to http://localhost:8080/.

## Game rules

1. At the beginning of the game, four seeds are placed in each house. This is the traditional method.
2. Each player controls the six houses and their seeds on the player's side of the board. The player's score is the number of seeds in the store to their right.
3. Players take turns sowing their seeds. On a turn, the player removes all seeds from one of the houses under their control. Moving counter-clockwise, the player drops one seed in each house in turn, including the player's own store but not their opponent's.
4. If the last sown seed lands in an empty house owned by the player, and the opposite house contains seeds, both the last seed and the opposite seeds are captured and placed into the player's store.
5. If the last sown seed lands in the player's store, the player gets an additional move. There is no limit on the number of moves a player can make in their turn.
6. When one player no longer has any seeds in any of their houses, the game ends. The other player moves all remaining seeds to their store, and the player with the most seeds in their store wins.