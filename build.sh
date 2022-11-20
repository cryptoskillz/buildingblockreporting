# Detect param or set default to local:
if [ -z $1 ]
then
echo -e 'No environment param set.\n Defaulting to local'
export ELEVENTY_ENV='local'
else 
export ELEVENTY_ENV=$1
fi



wipeOutOldBuild () {
    echo 'Wiping out old build directory'
    rm -rf ./_site/**
}

#delete the files in the site dir
wipeOutOldBuild
#run eleventy
npx @11ty/eleventy 

echo "killing rouge wrangler"
kill -9 `lsof -t -i:8788`

echo "starting wrangler"
wrangler pages dev _site --binding SECRET=fdfdf --d1=buildingblocks --kv=kvdata   --local --live-reload   &

if [[ $ELEVENTY_ENV == 'cypress' ]]
then
echo "wiping KV stores"
rm -rf ./.mf/**
echo "Running cypress tests"
npx cypress run --record --key 86650f1f-8d3c-4c96-a862-58cf46101a5b
exit
fi

