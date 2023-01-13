import { UploadedFiles, FileValidator, ParseFilePipe, UseInterceptors } from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MAX_IMAGE_UPLOAD, UPLOAD_DIR, MB, MAX_UPLOAD_SIZE } from './post.constants';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v1 as uuidv1 } from 'uuid';


class MaxFileSize extends FileValidator<{maxSize: number}>{
    constructor(options: {maxSize: number}){
        super(options)
    }

    isValid(files?: Express.Multer.File[]): boolean | Promise<boolean> {
        return files.every(file => file.size <= (this.validationOptions.maxSize * MB))
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    buildErrorMessage(file: any): string {
        return `File uploaded is too big. Max size is (${this.validationOptions.maxSize} MB)`
    }
}

export const PostUploadedFiles = () => UploadedFiles(
    new ParseFilePipe({
        validators: [
            new MaxFileSize({
                maxSize: MAX_UPLOAD_SIZE
            })
        ]
    })
)

export const AcceptMultipleFiles = () => UseInterceptors(FilesInterceptor('files', MAX_IMAGE_UPLOAD, {
    storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
            cb(null, `${uuidv1()}${path.extname(file.originalname)}`)
        }
    })
}))

export const MultipartBody = () => ApiConsumes('multipart/form-data')
