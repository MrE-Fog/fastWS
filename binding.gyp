{
  'targets': [
    {
      'target_name': 'uWS',
      'sources': [
        'src/uWebSockets.js/src/addon.cpp'
      ],
      'dependencies': [ 'uWebSockets' ],
      'include_dirs': [
        'src/uWebSockets.js/uWebSockets/uSockets/src',
        'src/uWebSockets.js/uWebSockets/src',
      ],
      'defines': [
        'LIBUS_USE_LIBUV',
      ],
      'cflags': [
        '-std=c++17',
        '-flto',
        '-O3',
      ],
      'conditions': [
        [ 'OS!="win"', {
            'cflags+': [ '-std=c++17', '-flto', '-O3' ],
            'cflags_c+': [ '-std=c++17', '-flto', '-O3' ],
            'cflags_cc+': [ '-std=c++17', '-flto', '-O3' ],
        } ],
        [ 'OS=="mac"', {
          'xcode_settings': {
            'OTHER_CFLAGS': [
              '-std=c++17',
              '-stdlib=libc++',
              '-flto',
              '-O3',
            ],
          },
        } ]
      ],
    },
    {
      'target_name': 'uWebSockets',
      'type': 'shared_library',
      'sources': [
        '<!@(ls -1 src/uWebSockets.js/uWebSockets/uSockets/src/*.c)',
        '<!@(ls -1 src/uWebSockets.js/uWebSockets/uSockets/src/eventing/*.c)'
      ],
      'include_dirs': [
        'src/uWebSockets.js/uWebSockets/uSockets/src',
      ],
      'defines': [
        'LIBUS_USE_LIBUV',
      ],
      'cflags': [
        '-flto',
        '-O3',
      ],
      'cflags_cc': [
        '-flto',
        '-O3',
      ],
      'conditions': [
        [ 'OS!="win"', {
            'cflags+': [ '-flto', '-O3' ],
            'cflags_c+': [ '-flto', '-O3' ],
            'cflags_cc+': [ '-flto', '-O3' ],
        } ],
        [ 'OS=="mac"', {
          'xcode_settings': {
            'OTHER_CFLAGS': [
              '-flto',
              '-O3',
            ],
          },
        } ]
      ],
    }
  ]
}
