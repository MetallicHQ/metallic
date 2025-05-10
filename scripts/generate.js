const { execSync } = require('child_process');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

const CMD =
  'protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto ' +
  '--ts_proto_out=packages/node/lib/generated ' +
  '--ts_proto_opt=outputServices=grpc-js,env=node ' +
  '-I=./proto proto/*.proto';

try {
  execSync(CMD, { stdio: 'inherit', shell: true, cwd: rootDir });
} catch (err) {
  process.exitCode = err.status || 1;
}
