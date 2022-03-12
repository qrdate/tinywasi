import * as crypto from "crypto";

export class TinyWASI
{
	private instance?: WebAssembly.Instance = undefined;

	private WASI_ERRNO_SUCCESS = 0;
	private WASI_ERRNO_BADF = 8;
	private WASI_ERRNO_NOSYS = 52;
	private WASI_ERRNO_INVAL = 28;

	private WASI_FILETYPE_CHARACTER_DEVICE = 2;

	imports: { [ key: string ]: { [ key: string ]: CallableFunction | undefined } } = {
		wasi_snapshot_preview1:
		{
			args_get: undefined, // ((param i32 i32) (result i32))
			args_sizes_get: undefined, // ((param i32 i32) (result i32))

			clock_res_get: this.clock_res_get, // ((param i32 i32) (result i32))
			clock_time_get: this.clock_time_get, // ((param i32 i64 i32) (result i32))

			environ_get: undefined, // ((param i32 i32) (result i32))
			environ_sizes_get: undefined, // ((param i32 i32) (result i32))

			fd_advise: undefined, // ((param i32 i64 i64 i32) (result i32))
			fd_allocate: undefined, // ((param i32 i64 i64) (result i32))
			fd_close: undefined, // ((param i32) (result i32))
			fd_datasync: undefined, // ((param i32) (result i32))
			fd_fdstat_get: this.fd_fdstat_get, // ((param i32 i32) (result i32))
			fd_fdstat_set_flags: undefined, // ((param i32 i32) (result i32))
			fd_fdstat_set_rights: undefined, // ((param i32 i64 i64) (result i32))
			fd_filestat_get: undefined, // ((param i32 i32) (result i32))
			fd_filestat_set_size: undefined, // ((param i32 i64) (result i32))
			fd_filestat_set_times: undefined, // ((param i32 i64 i64 i32) (result i32))
			fd_pread: undefined, // ((param i32 i32 i32 i64 i32) (result i32))
			fd_prestat_dir_name: undefined, // ((param i32 i32 i32) (result i32))
			fd_prestat_get: undefined, // ((param i32 i32) (result i32))
			fd_pwrite: undefined, // ((param i32 i32 i32 i64 i32) (result i32))
			fd_read: undefined, // ((param i32 i32 i32 i32) (result i32))
			fd_readdir: undefined, // ((param i32 i32 i32 i64 i32) (result i32))
			fd_renumber: undefined, // ((param i32 i32) (result i32))
			fd_seek: undefined, // ((param i32 i64 i32 i32) (result i32))
			fd_sync: undefined, // ((param i32) (result i32))
			fd_tell: undefined, // ((param i32 i32) (result i32))
			fd_write: this.fd_write, // ((param i32 i32 i32 i32) (result i32))

			path_create_directory: undefined, // ((param i32 i32 i32) (result i32))
			path_filestat_get: undefined, // ((param i32 i32 i32 i32 i32) (result i32))
			path_filestat_set_times: undefined, // ((param i32 i32 i32 i32 i64 i64 i32) (result i32))
			path_link: undefined, // ((param i32 i32 i32 i32 i32 i32 i32) (result i32))
			path_open: undefined, // ((param i32 i32 i32 i32 i32 i64 i64 i32 i32) (result i32))
			path_readlink: undefined, // ((param i32 i32 i32 i32 i32 i32) (result i32))
			path_remove_directory: undefined, // ((param i32 i32 i32) (result i32))
			path_rename: undefined, // ((param i32 i32 i32 i32 i32 i32) (result i32))
			path_symlink: undefined, // ((param i32 i32 i32 i32 i32) (result i32))
			path_unlink_file: undefined, // ((param i32 i32 i32) (result i32))

			poll_oneoff: undefined, // ((param i32 i32 i32 i32) (result i32))

			proc_exit: undefined, // ((param i32))
			proc_raise: undefined, // ((param i32) (result i32))

			random_get: this.random_get, // ((param i32 i32) (result i32))

			sched_yield: undefined, // ((result i32))

			sock_recv: undefined, // ((param i32 i32 i32 i32 i32 i32) (result i32))
			sock_send: undefined, // ((param i32 i32 i32 i32 i32) (result i32))
			sock_shutdown: undefined, // ((param i32 i32) (result i32))
		}
	};


	constructor( trace?: boolean )
	{
		for( let ns of Object.keys( this.imports ) )
		{
			const nameSpace = this.imports[ ns ];

			for( let fn of Object.keys( nameSpace ) )
			{
				let func = nameSpace[ fn ] || this.nosys( fn );

				func = func.bind( this );

				if( trace )
					func = this.trace( fn, func ).bind( this );

				nameSpace[ fn ] = func;
			}
		}
	}

	initialize( instance: WebAssembly.Instance )
	{
		this.instance = instance;

		const initialize = instance.exports._initialize as CallableFunction;
		initialize();
	}


	private getMemory(): WebAssembly.Memory
	{
		if( this.instance )
			return ( this.instance.exports.memory as WebAssembly.Memory );
		else
			throw new Error( "Attempt to access instance before initialisation!" );
	}

	private getDataView(): DataView
	{
		if( this.instance )
			return new DataView( ( this.instance.exports.memory as WebAssembly.Memory ).buffer );
		else
			throw new Error( "Attempt to access instance before initialisation!" );
	}

	private trace( name: string, origFunc: CallableFunction ): CallableFunction
	{
		return ( ...args: number[] ): number =>
		{
			const result = origFunc( ...args );
			console.log( `Trace: ${name}(${args.toString()}) -> ${result}` );
			return result;
		}
	}

	private nosys( name: string ): CallableFunction
	{
		return ( ...args: number[] ): number =>
		{
			console.error( `Unimplemented call to ${name}(${args.toString()})` );
			return this.WASI_ERRNO_NOSYS;
		}
	}


	private clock_res_get( id: number, resOut: number ): number
	{
		if( id != 0 )
			return this.WASI_ERRNO_INVAL;

		const view = this.getDataView();

		view.setUint32( resOut, 1000000.0 % 0xFFFFFFFF, true );
		view.setUint32( resOut + 4, 1000000.0 / 0xFFFFFFFF, true );

		return this.WASI_ERRNO_SUCCESS;
	}

	private clock_time_get( id: number, precision: number, timeOut: number ): number
	{
		if( id != 0 )
			return this.WASI_ERRNO_INVAL;

		const view = this.getDataView();

		const now = new Date().getTime();

		view.setUint32( timeOut, ( now * 1000000.0 ) % 0xFFFFFFFF, true );
		view.setUint32( timeOut + 4, now * 1000000.0 / 0xFFFFFFFF, true );

		return this.WASI_ERRNO_SUCCESS;
	}


	private fd_fdstat_get( fd: number, fdstat: number ): number
	{
		if( fd > 2 )
			return this.WASI_ERRNO_BADF;

		const view = this.getDataView();

		view.setUint8( fdstat, this.WASI_FILETYPE_CHARACTER_DEVICE );
		view.setUint16( fdstat + 2, 0b1, true );
		view.setUint16( fdstat + 8, 0b101001, true );
		view.setUint16( fdstat + 16, 0, true );

		return this.WASI_ERRNO_SUCCESS;
	}

	private fd_write( fd: number, iovs: number, iovsLen: number, nwritten: number ): number
	{
		if( fd > 2 )
			return this.WASI_ERRNO_BADF;

		const view = this.getDataView();
		const memory = this.getMemory();

		let buffers: Uint8Array[] = []

		for( let i = 0; i < iovsLen; i++ )
		{
			const iov = iovs + i * 8;
			const offset = view.getUint32( iov, true );
			const len = view.getUint32( iov + 4, true );

			buffers.push( new Uint8Array( memory.buffer, offset, len ) );
		}

		const length = buffers.reduce( ( s, b ) => s + b.length, 0 );

		const buffer = new Uint8Array( length );
		let offset = 0;

		buffers.forEach( b =>
		{
			buffer.set( b, offset );
			offset += b.length;
		} );

		const string = new TextDecoder( "utf-8" ).decode( buffer ).replace( /\n$/, "" );

		if( fd == 1 )
			console.log( string );
		else
			console.error( string );

		view.setUint32( nwritten, buffer.length, true );

		return this.WASI_ERRNO_SUCCESS;
	}


	private random_get( pointer: number, size: number ): number
	{
		const memory = this.getMemory();

		const buffer = new Uint8Array( memory.buffer, pointer, size )

		crypto.randomFillSync( buffer );

		return this.WASI_ERRNO_SUCCESS;
	}
}