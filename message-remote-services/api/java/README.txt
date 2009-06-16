Directory Layout :

src/ Java sources
test_up/ Java Test cases (Junit 3), to launch when thunderbird is launched
test_down Java Test cases (Junit 3), to launch when thunderbird is NOT launched
lib/ library dependencies to include in your project
res/ ressources need for the Unit Tests
tools/ library needed for Ant
javadoc/ HTML Javadoc of the API


TO COMPILE : 
ant compile

TO TEST :
ant test_up_send // Test the send function of the API 
ant test_up_browse  // Test the browse function of the API
ant test_up_scenari  // perform some send browse 
ant test_down // perform some exception checks when thunderbird is NOT launched



