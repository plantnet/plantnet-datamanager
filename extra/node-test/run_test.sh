NODEUNIT="node_modules/nodeunit/bin/nodeunit"
if [ ! -f $NODEUNIT ]; then
	NODEUNIT="nodeunit"
fi

CMD="$NODEUNIT $@"
$CMD