# Development

To develop the application, you need at least a nodejs environment.

In addition, ensure that protobuf compiler `protoc` is installed and added to the `PATH` environment variable before running `npm install`.

After running `npm install`, it will automatically generate an internal library `@internal/gen-grpc` from `gen-grpc` folder containing javascript protobuf files with types and `.proto` files.

## Available Scripts

In the project directory, you can run:

### `npm run electron-dev`

Starts up the webapp on `localhost:3000` and creates an Electron instance that is pointed at the webapp.

Run `npm install grpc --runtime=electron --target=7.0.0` prior to launching this command.

### `npm run electron-dev-simple`

Creates an Electron instance that is pointed at the webapp, so assumes that the dev server is already up.
Useful for running multiple instance of the application in development.

Run `npm install grpc --runtime=electron --target=7.0.0` prior to launching this command.

### `npm run dist`

Builds the app for Electron and creates a platform specific executable ( .exe on Windows, .dmg on MacOS, AppImage on Linux, the outputs can be further configured)

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

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
