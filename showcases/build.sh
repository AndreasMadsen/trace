
tracedir=$(dirname $(dirname $PWD))

function format {
  output=$(node --stack_trace_limit=100 $@ 2>&1)
  output=${output//</&lt;}
  output=${output//>/&gt;}
  output=${output//$tracedir/}
  echo "$output"
}

function highlight {
  output=$(cat $1)
  output=${output//const/<span class=\"keyword\">const<\/span>}
  output=${output//throw/<span class=\"keyword\">throw<\/span>}
  output=${output//function/<span class=\"keyword\">function<\/span>}
  output=${output//new/<span class=\"keyword\">new<\/span>}
  output=$(echo "$output" | gsed -e "s/'[^']*'/<span class=\"string\">\0<\/span>/g")
  output=$(echo "$output" | gsed -e "s/[0-9]\+/<span class=\"number\">\0<\/span>/g")
  output=$(echo "$output" | gsed -e "s/\([a-zA-Z]\+\)[(]/<span class=\"function\">\1<\/span>(/g")
  echo "$output"
}

for FILENAME in basic.js timers.js http.js
do
  if [ $FILENAME = "basic.js" ]; then
    echo "<code class=\"content\" data-file=\"$FILENAME\">"
  else
    echo "<code class=\"content\" data-file=\"$FILENAME\" hidden>"
  fi

  highlight $FILENAME
  echo "</code>"
  echo ''
done

echo "<code id=\"command\">$ node --stack_trace_limit=100 -r trace -r clarify wired.js</code>"
echo ''

for FILENAME in basic.js timers.js http.js
do
  echo "<code class=\"output\" data-file=\"$FILENAME\" hidden>"
  format $FILENAME
  echo "</code>"
  echo ''

  echo "<code class=\"output\" data-file=\"$FILENAME\" data-trace hidden>"
  format -r trace $FILENAME
  echo "</code>"
  echo ''

  echo "<code class=\"output\" data-file=\"$FILENAME\" data-clarify hidden>"
  format -r clarify $FILENAME
  echo "</code>"
  echo ''

  if [ $FILENAME = "basic.js" ]; then
    echo "<code class=\"output\" data-file=\"$FILENAME\" data-trace data-clarify>"
  else
    echo "<code class=\"output\" data-file=\"$FILENAME\" data-trace data-clarify hidden>"
  fi
  format -r clarify -r trace $FILENAME
  echo "</code>"
  echo ''
done
