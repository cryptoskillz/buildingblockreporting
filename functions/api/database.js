export async function onRequest(context) { 

    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
    } = context;


  // Create a prepared statement with our query
  console.log(context.env.buildingblocks)
  
  const ps = context.env.buildingblocks.prepare('SELECT * from property'); 
  const result = await ps.first();
  //console.log(data)
  return Response.json(result);
  
  //return Response.json("{'aaa':'bbb'}")
}