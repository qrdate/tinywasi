import * as crypto from "crypto";

export class TinyWASI
{
	private instance?: WebAssembly.Instance = undefined;

	private WASI_ERRNO_SUCCESS = 0;
	private WASI_ERRNO_BADF = 8;
	private WASI_ERRNO_FAULT = 21;
	private WASI_ERRNO_NOSYS = 52;

	private WASI_FILETYPE_CHARACTER_DEVICE = 2;

	imports = {
		wasi_snapshot_preview1:
		{
			args_get: this.nosys( "args_get" ).bind( this ), // (param i32 i32) (result i32))
			args_sizes_get: this.nosys( "args_sizes_get" ).bind( this ), // (param i32 i32) (result i32))

			clock_res_get: this.nosys( "clock_res_get" ).bind( this ), // (param i32 i32) (result i32))
			clock_time_get: this.clock_time_get.bind( this ), // (param i32 i64 i32) (result i32))

			environ_get: this.nosys( "environ_get" ).bind( this ), // (param i32 i32) (result i32))
			environ_sizes_get: this.nosys( "environ_sizes_get" ).bind( this ), // (param i32 i32) (result i32))

			fd_advise: this.nosys( "fd_advise" ).bind( this ), // (param i32 i64 i64 i32) (result i32))
			fd_allocate: this.nosys( "fd_allocate" ).bind( this ), // (param i32 i64 i64) (result i32))
			fd_close: this.nosys( "fd_close" ).bind( this ), // (param i32) (result i32))
			fd_datasync: this.nosys( "fd_datasync" ).bind( this ), // (param i32) (result i32))
			fd_fdstat_get: this.fd_fdstat_get.bind( this ), // (param i32 i32) (result i32))
			fd_fdstat_set_flags: this.nosys( "fd_fdstat_set_flags" ).bind( this ), // (param i32 i32) (result i32))
			fd_fdstat_set_rights: this.nosys( "fd_fdstat_set_rights" ).bind( this ), // (param i32 i64 i64) (result i32))
			fd_filestat_get: this.nosys( "fd_filestat_get" ).bind( this ), // (param i32 i32) (result i32))
			fd_filestat_set_size: this.nosys( "fd_filestat_set_size" ).bind( this ), // (param i32 i64) (result i32))
			fd_filestat_set_times: this.nosys( "fd_filestat_set_times" ).bind( this ), // (param i32 i64 i64 i32) (result i32))
			fd_pread: this.nosys( "fd_pread" ).bind( this ), // (param i32 i32 i32 i64 i32) (result i32))
			fd_prestat_dir_name: this.nosys( "fd_prestat_dir_name" ).bind( this ), // (param i32 i32 i32) (result i32))
			fd_prestat_get: this.nosys( "fd_prestat_get" ).bind( this ), // (param i32 i32) (result i32))
			fd_pwrite: this.nosys( "fd_pwrite" ).bind( this ), // (param i32 i32 i32 i64 i32) (result i32))
			fd_read: this.nosys( "fd_read" ).bind( this ), // (param i32 i32 i32 i32) (result i32))
			fd_readdir: this.nosys( "fd_readdir" ).bind( this ), // (param i32 i32 i32 i64 i32) (result i32))
			fd_renumber: this.nosys( "fd_renumber" ).bind( this ), // (param i32 i32) (result i32))
			fd_seek: this.nosys( "fd_seek" ).bind( this ), // (param i32 i64 i32 i32) (result i32))
			fd_sync: this.nosys( "fd_sync" ).bind( this ), // (param i32) (result i32))
			fd_tell: this.nosys( "fd_tell" ).bind( this ), // (param i32 i32) (result i32))
			fd_write: this.fd_write.bind( this ), // (param i32 i32 i32 i32) (result i32))

			path_create_directory: this.nosys( "path_create_directory" ).bind( this ), // (param i32 i32 i32) (result i32))
			path_filestat_get: this.nosys( "path_filestat_get" ).bind( this ), // (param i32 i32 i32 i32 i32) (result i32))
			path_filestat_set_times: this.nosys( "path_filestat_set_times" ).bind( this ), // (param i32 i32 i32 i32 i64 i64 i32) (result i32))
			path_link: this.nosys( "path_link" ).bind( this ), // (param i32 i32 i32 i32 i32 i32 i32) (result i32))
			path_open: this.nosys( "path_open" ).bind( this ), // (param i32 i32 i32 i32 i32 i64 i64 i32 i32) (result i32))
			path_readlink: this.nosys( "path_readlink" ).bind( this ), // (param i32 i32 i32 i32 i32 i32) (result i32))
			path_remove_directory: this.nosys( "path_remove_directory" ).bind( this ), // (param i32 i32 i32) (result i32))
			path_rename: this.nosys( "path_rename" ).bind( this ), // (param i32 i32 i32 i32 i32 i32) (result i32))
			path_symlink: this.nosys( "path_symlink" ).bind( this ), // (param i32 i32 i32 i32 i32) (result i32))
			path_unlink_file: this.nosys( "path_unlink_file" ).bind( this ), // (param i32 i32 i32) (result i32))

			poll_oneoff: this.nosys( "poll_oneoff" ).bind( this ), // (param i32 i32 i32 i32) (result i32))

			proc_exit: this.nosys( "proc_exit" ).bind( this ), // (param i32))
			proc_raise: this.nosys( "proc_raise" ).bind( this ), // (param i32) (result i32))

			random_get: this.random_get.bind( this ), // (param i32 i32) (result i32))

			sched_yield: this.nosys( "sched_yield" ).bind( this ), // (result i32))

			sock_recv: this.nosys( "sock_recv" ).bind( this ), // (param i32 i32 i32 i32 i32 i32) (result i32))
			sock_send: this.nosys( "sock_send" ).bind( this ), // (param i32 i32 i32 i32 i32) (result i32))
			sock_shutdown: this.nosys( "sock_shutdown" ).bind( this ), // (param i32 i32) (result i32))
		}
	};


	constructor( trace?: boolean )
	{
		if( trace )
		{
			for( let ns of Object.keys( this.imports ) )
			{
				const nameSpace = this.imports[ ns ];

				for( let f of Object.keys( nameSpace ) )
				{
					const origFunc = nameSpace[ f ];
					nameSpace[ f ] = this.trace( f, origFunc );
				}
			}
		}
	}

	initialize( instance: WebAssembly.Instance )
	{
		this.instance = instance;

		const initialize = instance.exports._initialize as CallableFunction;
		initialize();
	}

	start( instance: WebAssembly.Instance )
	{
		this.instance = instance;

		const start = instance.exports._start as CallableFunction;
		start();
	}


	private getMemory(): WebAssembly.Memory | undefined
	{
		if( this.instance )
			return ( this.instance.exports.memory as WebAssembly.Memory );
	}

	private getDataView(): DataView | undefined
	{
		if( this.instance )
			return new DataView( ( this.instance.exports.memory as WebAssembly.Memory ).buffer );
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


	private fd_fdstat_get( fd: number, fdstat: number ): number
	{
		if( fd > 2 )
			return this.WASI_ERRNO_BADF;

		const view = this.getDataView();

		if( !view )
			return this.WASI_ERRNO_FAULT;

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

		if( !view || !memory )
			return this.WASI_ERRNO_FAULT;

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

	private clock_time_get( clockId: number, precision: number, time: number ): number
	{
		const view = this.getDataView();

		if( !view )
			return this.WASI_ERRNO_FAULT;

		const now = new Date().getTime();

		view.setUint32( time, ( now * 1000000.0 ) % 0xFFFFFFFF, true );
		view.setUint32( time + 4, now * 1000000.0 / 0xFFFFFFFF, true );

		return this.WASI_ERRNO_SUCCESS;
	}

	private random_get( pointer: number, size: number ): number
	{
		const view = this.getDataView();
		const memory = this.getMemory();

		if( !view || !memory )
			return this.WASI_ERRNO_FAULT;

		const buffer = new Uint8Array( memory.buffer, pointer, size )

		crypto.randomFillSync( buffer );

		return this.WASI_ERRNO_SUCCESS;
	}
}