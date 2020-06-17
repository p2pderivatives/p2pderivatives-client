# p2pderivatives-client

Repository for the P2PDerivatives client

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Ensure that protobuf compiler `protoc` is installed and added to `PATH` before running `npm install`.

After running `npm install`, it will automatically generate an internal library `@internal/gen-grpc` from `gen-grpc` folder containing javascript protobuf files with types and `.proto` files.

## Available Scripts

In the project directory, you can run:

### `npm run electron-dev`

Starts up the webapp on `localhost:3000` and creates an Electron instance that is pointed at the webapp.

### `npm run dist`

Builds the app for Electron and creates a platform specific executable ( .exe on Windows, .dmg on MacOS, AppImage on Linux, the outputs can be further configured)

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run mocha`

This will run integration tests on a full electron instance. Since it is being run on electron and the current libraries are built for the local OS, you will need to rebuild them for electron, in specifically the `grpc` library.

`npm install grpc --runtime=electron --target=7.0.0`

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Integration Tests

The client integration tests requires multiple services to run:

- Rest Oracle [documentation](https://github.com/cryptogarageinc/p2pderivatives-oracle)
- Grpc Server [documentation](https://github.com/cryptogarageinc/p2pderivatives-server)
- BitcoinD instance running on `regtest`

You can run all of those services on your local machine using `docker-compose up`

The services will need some migration to run the integration tests.
You can seed the services for integration tests using `./services/seed-services.sh`
or by service using a specific script  
`docker-compose exec <service-name> /bin/sh /scripts/<my-script-name>`

You can then run all the integration tests using `npm run integration`
