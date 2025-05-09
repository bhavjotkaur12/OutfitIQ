@echo off
"C:\\Program Files\\Java\\jdk-17\\bin\\java" ^
  --class-path ^
  "C:\\Users\\Concierge\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  x86_64 ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\CONCIE~1\\AppData\\Local\\Temp\\agp-prefab-staging3979479569699436402\\staged-cli-output" ^
  "C:\\Users\\Concierge\\.gradle\\caches\\8.13\\transforms\\8cb416b8178cb0e7f140959230f7f0bf\\transformed\\react-android-0.79.2-debug\\prefab" ^
  "C:\\Users\\Concierge\\.gradle\\caches\\8.13\\transforms\\b91a94c10768de6e7e46fcdf99215bf3\\transformed\\hermes-android-0.79.2-debug\\prefab" ^
  "C:\\Users\\Concierge\\.gradle\\caches\\8.13\\transforms\\72cde7dc85b5006383f56c98fcfedfa5\\transformed\\fbjni-0.7.0\\prefab"
