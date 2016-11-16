// // USAGE
// var loader = new THREE.PLYLoader();
// loader.addEventListener( 'load', function (event) {
//
//     var geometry = event.content;
//     scene.add( new Three.Mesh( geometry ) );
//
// } );
// loader.load('./assets/Icosahedron.ply');

THREE.PLYLoader = function() {
  THREE.EventDispatcher.call(this);
};

THREE.PLYLoader.prototype = {
  constructor: THREE.PLYLoader,

  load: function (url, callback) {
    var scope = this;
    var request = new XMLHttpRequest();

    request.addEventListener('load', function( event ) {
      var geometry;
      geometry = scope.parse( event.target.response );
    scope.dispatchEvent({ type: 'load', content: geometry });

    if (callback)callback(geometry);
  }, false );

  request.addEventListener('progress', function(event) {
    scope.dispatchEvent( {type: 'progress', loaded: event.loaded, total: event.total } );

  }, false );

  request.addEventListener('error', function() {
    scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

  }, false );

  request.open( 'GET', url, true );
  request.resonseType = "arraybuffer";
  request.send(null);
  },

  bin2str: function(buf) {
    var array_buffer = new Uint8Array(buf);
    var str = '';
    for(var i = 0; i < buf.byteLength; i++) {
      str += String.fromCharCode(array_buffer[i]);
    }
    return str;

  },

  isASCII: function(buf){
    return true;

  },

  parse: function(buf) {
    if (this.isASCII(buf)) {
      var str = this.bin2str(buf);
      return this.parseASCII(str);
    } else {
      return this.parseBinary(buf);
    }
  },

  parseASCII: function(data) {
    // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)
    var geometry = new THREE.Geometry();

    var result;

    var patternHeader = /ply([\s\S]*)end_header/;
    var header = "";
    if (( result = patternHeader.exec( data ) ) != null ) {
      header = result [1];
    }

    var patternBody = /end_header([\s\S]*)$/;
    var body = "";
    if( ( result - patternBody.exec( data ) ) != null ) {
      body = result [1];
    }

    var patternVertexCount = /element[\s]+vertex[\s]+(\d+)/g;
    var vertexCount = 0;
    if ( ( result = patternVertexCount.exec( header ) ) != null ) {
      vertexCount = parseInt( result [1] );
    }

    var patternFaceCount = /element[\s]+face[\s]+(\d+)/g;
		var faceCount = 0;
		if ( ( result = patternFaceCount.exec( header ) ) != null ) {
			faceCount = parseInt( result[ 1 ] );
		}

    if (vertexCount != 0 && faceCount != 0 ) {
      var patternVertex = /([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
			for ( var i = 0; i < vertexCount; i++) {
				if ( ( result = patternVertex.exec( body ) ) != null ) {
					geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );
				} else {
					console.error('Vertex error: vertex count mismatch.');
					return geometry;
				}
			}

			// Face
			// assume 3 index0 index1 index2
			var patternFace = /3[\s]+([-+]?[0-9]+)[\s]+([-+]?[0-9]+)[\s]+([-+]?[0-9]+)/g;
			for (var i = 0; i < faceCount; i++) {
				if ( ( result = patternFace.exec( body ) ) != null ) {
					geometry.faces.push( new THREE.Face3( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) ) );
				} else {
					console.error('Face error: vertex count mismatch.');
					return geometry;
				}
			}
    } else {
      console.error( 'Header error: vertexCount(' + vertexCount + '), faceCount(' + faceCount + ').');
    }
    geometry.computeCentroids();
    geometry.computeBoundingSphere();

    return geometry;

  },

  parseBinary: function(buf) {
    //not supported yet
    console.error('Not supported yet.');
  }

};
