export default `if (window && !('Deno' in window)) {
	Object.defineProperty(window, 'Deno', {
		value: getPolyfill(),
		writable: false,
		enumerable: true,
		configurable: true,
	})
}

function mocked() {
	console.warn('This api has not been ported to the browser.  Using mock')
}

function noSupport() {
	throw new Error('This api is not supported by browsers.')
}

class NoSupport {
	constructor() {
		noSupport()
	}
}

const fs = fsService()

class PermissionStatus {
	state = 'granted'
}

class Permissions {
	query() {
		return Promise.resolve(new PermissionStatus('granted'))
	}

	revoke() {
		return Promise.resolve(new PermissionStatus('granted'))
	}

	request() {
		return Promise.resolve(new PermissionStatus('granted'))
	}
}

function getPolyfill() {
	return {
		/**
		 * Unstable APIs
		 */

		// Functions
		applySourceMap() {
			mocked()
			return {
				filename: '<file>',
				line: 1,
				column: 0,
			}
		},

		bundle() {
			mocked()
			return [undefined, '']
		},

		compile() {
			mocked()
			return [undefined, {}]
		},

		connect: noSupport,
		consoleSize: noSupport,
		createHttpClient: noSupport,

		fdatasync() {
			mocked()
			return Promise.resolve()
		},

		fdatasync() {
			mocked()
		},

		formatDiagnostics: noSupport,
		fstat: noSupport,
		fstatSync: noSupport,
		fsync: noSupport,
		fsyncSync: noSupport,
		ftruncate: noSupport,
		ftruncateSync: noSupport,
		futime: noSupport,
		futimeSync: noSupport,

		hostname() {
			return location.hostname
		},

		kill() {
			mocked()
		},

		link(oldPath, newPath) {
			return Promise.resolve(this.linkSync(oldPath, newPath))
		},

		linkSync(oldPath, newPath) {
			fs.link(oldPath, newPath)
		},

		listen: noSupport,
		listenDatagram: noSupport,

		loadAvg() {
			return [0, 0, 0]
		},

		openPlugin: noSupport,

		osRelease() {
			return 'browser'
		},

		setRaw() {
			mocked()
		},

		shutdown() {
			mocked()
			return Promise.resolve()
		},

		signal: noSupport,
		startTls: noSupport,

		symlink(oldPath, newPath) {
			return this.link(oldPath, newPath)
		},

		symlinkSync(oldPath, newPath) {
			return this.linkSync(oldPath, newPath)
		},

		systemMemoryInfo: noSupport,

		transpileOnly(sources) {
			mocked()
			const newSources = {}
			for (const key of sources) {
				newSources[key] = { source: '' }
			}
			return newSources
		},

		unmask: noSupport,
		utime: noSupport,
		utimeSync: noSupport,

		// Variables
		Signal: {},
		permissions: new Permissions(),
		ppid: 0,
		signals: {
			alarm: noSupport,
			child: noSupport,
			hungup: noSupport,
			interrupt: noSupport,
			io: noSupport,
			pipe: noSupport,
			quit: noSupport,
			terminate: noSupport,
			userDefined1: noSupport,
			userDefined2: noSupport,
			windowChange: noSupport,
		},

		// Classes
		HttpClient: NoSupport,
		PermissionStatus,
		Permissions,
		SignalStream: NoSupport,

		/**
		 * Stable APIs
		 */
		// Functions
		chdir() {
			mocked()
		},

		chmod: noSupport,
		chmodSync: noSupport,
		chown: noSupport,
		chownSync: noSupport,

		close() {
			mocked()
		},

		connect: noSupport,
		connectTls: noSupport,
		copy: noSupport,

		copyFile(p1, p2) {
			return Promise.resolve(this.copySync(p1, p2))
		},

		copyFileSync(fromPath, toPath) {
			// TODO
		},

		create(path) {
			return Promise.resolve(this.createSync(path))
		},

		createSync(path) {
			fs.create(path)
		},

		cwd() {
			return location.origin + location.pathname
		},

		execPath() {
			return '/usr/bin/deno'
		},

		exit() {
			window.close()
		},

		inspect(input) {
			mocked()
			return input
		},

		issatty() {
			return false
		},

		iter: iter,
		iterSync: iterSync,

		listenTls: noSupport,
		lstat: noSupport,
		lstatSync: noSupport,

		makeTempDir(opts) {
			return Promise.resolve(this.makeTempDirSync(opts))
		},

		makeTempDirSync(opts) {
			// TODO
		},

		makeTempFile(opts) {
			return Promise.resolve(this.makeTempFileSync(opts))
		},

		makeTempFileSync(opts) {
			// TODO
		},

		metrics() {
			return {
				opsDispatched: 0,
				opsDispatchedSync: 0,
				opsDispatchedAsync: 0,
				opsDispatchedAsyncUnref: 0,
				opsCompleted: 0,
				opsCompletedSync: 0,
				opsCompletedAsync: 0,
				opsCompletedAsyncUnref: 0,
				bytesSentControl: 0,
				bytesSentData: 0,
				bytesReceived: 0,
			}
		},

		mkdir(p, o) {
			return Promise.resolve(this.mkdirSync)
		},

		mkdirSync(path, options) {
			// TODO
		},

		open: noSupport,
		openSync: noSupport,
		read: noSupport,
		readAll: noSupport,
		readAllSync: noSupport,

		readDir(path) {
			return Promise.resolve(readDirSync(path))
		},

		readDirSync(path) {
			// TODO
		},

		readFile(path) {
			return Promise.resolve(this.readFileSync)
		},

		// errors: readOnly(errors),
		// pid: 0,
		// noColor: () => {
		// 	return true
		// },
		// test() {
		// 	mocked()
		// },
		// env: readOnly(env),
		// SeekMode: readOnly(SeekMode),
		// open: readOnly(open),
		// openSync: readOnly(openSync),
		// write: readOnly(write),
		// writeSync: readOnly(writeSync),
		// seek: readOnly(seek),
		// seekSync: readOnly(seekSync),
		// File: readOnly(File),
		// stdin: readOnly(stdin),
		// stdout: readOnly(stdout),
		// stderr: readOnly(stderr),
		// Buffer: readOnly(Buffer),
		// writeAll: readOnly(writeAll),
		// writeAllSync: readOnly(writeAllSync),
		// // TODO consider implementing
		// removeSync() {
		// 	mocked()
		// },
		// // TODO consider implementing
		// remove: readOnly(asyncNoop),
		// // TODO consider implementing
		// renameSync() {
		// 	mocked()
		// },
		// // TODO consider implementing
		// rename: readOnly(asyncNoop),
		// readTextFileSync: readOnly(readTextFileSync),
		// readTextFile: readOnly(readTextFile),
		// readFileSync: readOnly(readFileSync),
		// readFile: readOnly(readFile),
		// realPathSync: readOnly(realPathSync),
		// realPath: readOnly(realPath),
		// readLinkSync: readOnly(notImplemented),
		// readLink: readOnly(notImplemented),
		// stat: readOnly(notImplemented),
		// statSync: readOnly(notImplemented),
		// writeFileSync: readOnly(writeFileSync),
		// writeFile: readOnly(writeFile),
		// writeTextFileSync: readOnly(writeTextFileSync),
		// writeTextFile: readOnly(writeTextFile),
		// truncateSync: readOnly(truncateSync),
		// truncate: readOnly(truncate),
		// resources: readOnly(resources),
		// watchFs: readOnly(asyncGenNoop),
		// Process: readOnly(notImplemented),
		// run: readOnly(notImplemented),
		// // TODO consider implementing
		// build: readOnly(build),
		// version: readOnly(version),
		// args: readOnly([]),
		// customInspect: readOnly(customInspect),
		// // Intentionally not exposed in the types
		// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// // @ts-expect-error
		// internal: readOnly(Symbol.for('Deno internal')),
		// core: readOnly({}),
	}
}

function fsService() {
	function getMap() {
		try {
			return JSON.parse(localStorage.getItem('fs-map') || '{}')
		} catch (e) {
			return {}
		}
	}

	function setMap(map) {
		localStorage.setItem('fs-map', JSON.stringify(map))
	}

	function getSegments(path) {
		return path.split('/').filter(segment => segment.length)
	}

	function create(path) {
		const map = getMap()
		if (exists(path)) throw new Error('Path already exists.')

		const id = uuid()
		localStorage.setItem(id, new Uint8Array())
		map[path] = id

		setMap(map)
	}

	function exists(path) {
		let matchFound = false

		for (const key of getMap()) {
			const pathSegments = getSegments(path)
			const keySegments = getSegments(key)

			if (pathSegments.length > keySegments.length) continue

			const keyToTerms = keySegments.slice(0, pathSegments.length)

			if (arrayIsEqual(pathSegments, keyToTerms)) {
				matchFound = true
				break
			}
		}

		return matchFound
	}

	function remove(path) {
		const map = getMap()
		const id = map[path]
		localStorage.removeItem(id)
		delete map[path]
		setMap(map)
	}

	function write(path, data) {
		const map = getMap()
		const id = map[path]

		if (!id) throw new Error('File does not exist!')

		localStorage.setItem(id, data)
	}

	function read(path) {
		const map = getMap()
		const id = map[path]

		if (!id) throw new Error('File does not exist!')

		return localStorage.getItem(id)
	}

	function link(oldPath, newPath) {
		const map = getMap()
		const id = map[oldPath]

		if (!id) throw new Error('File does not exist!')

		map[newPath] = id
		setMap(map)
	}

	return {
		create,
		remove,
		exists,
		read,
		write,
		link,
	}
}

function arrayIsEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false

	let didFail = false

	for (let index of arr1) {
		if (arr1[index] !== arr2[index]) {
			didFail = true
			break
		}
	}

	return !didFail
}

const DEFAULT_BUFFER_SIZE = 32 * 1024

async function* iter(r, options) {
	const pre = options && options.bufSize
	const bufSize = pre === undefined ? DEFAULT_BUFFER_SIZE : pre
	const b = new Uint8Array(bufSize)
	while (true) {
		const result = await r.read(b)
		if (result === null) {
			break
		}

		yield b.subarray(0, result)
	}
}

function* iterSync(r, options) {
	const pre = options && options.bufSize
	const bufSize = pre === undefined ? DEFAULT_BUFFER_SIZE : pre
	const b = new Uint8Array(bufSize)
	while (true) {
		const result = r.readSync(b)
		if (result === null) {
			break
		}

		yield b.subarray(0, result)
	}
}
`