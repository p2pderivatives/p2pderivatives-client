PROTO_DIR=../p2pderivatives-proto
OUTPUT=.

mkdir -p $OUTPUT

for file in $PROTO_DIR/*.proto; do
  output_file=$OUTPUT/`basename $file`
  cat $file | awk '{gsub(/ \[\(validator.+\}\]/, "");gsub(/import "validator.proto";/, "")}1' > $output_file
done


$(npm bin)/grpc_tools_node_protoc \
--js_out=import_style=commonjs,binary:$OUTPUT \
--grpc_out=$OUTPUT \
--plugin=protoc-gen-grpc=$(npm bin)/grpc_tools_node_protoc_plugin \
-I $OUTPUT \
$OUTPUT/*.proto

protoc \
--plugin=protoc-gen-ts=$(npm bin)/protoc-gen-ts \
--ts_out=$OUTPUT \
-I $OUTPUT \
$OUTPUT/*.proto
