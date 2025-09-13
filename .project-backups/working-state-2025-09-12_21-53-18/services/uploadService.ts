import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number;
}

export class UploadService {
    // 파일 업로드
    static async uploadFile(file: File, path: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        try {
            // Firebase Storage 사용 (개발 환경에서는 에러를 발생시켜 MultimediaView에서 IndexedDB만 사용하도록 함)
            if (import.meta.env.DEV) {
                throw new Error('개발 환경에서는 IndexedDB를 사용합니다.');
            }
            
            // 프로덕션 환경에서는 실제 Firebase 사용
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('File upload error:', error);
            throw new Error('파일 업로드에 실패했습니다.');
        }
    }

    // 이미지 파일 업로드 (리사이징 포함)
    static async uploadImage(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        // 파일 크기 확인 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
        }

        // 이미지 타입 확인
        if (!file.type.startsWith('image/')) {
            throw new Error('이미지 파일만 업로드 가능합니다.');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const path = `images/${userId}/${fileName}`;
        
        return this.uploadFile(file, path, onProgress);
    }

    // 비디오 파일 업로드
    static async uploadVideo(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        // 파일 크기 확인 (100MB 제한)
        if (file.size > 100 * 1024 * 1024) {
            throw new Error('동영상 파일 크기는 100MB를 초과할 수 없습니다.');
        }

        // 비디오 타입 확인
        if (!file.type.startsWith('video/')) {
            throw new Error('비디오 파일만 업로드 가능합니다.');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const path = `videos/${userId}/${fileName}`;
        
        return this.uploadFile(file, path, onProgress);
    }

    // 오디오 파일 업로드
    static async uploadAudio(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        // 파일 크기 확인 (50MB 제한)
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('음성 파일 크기는 50MB를 초과할 수 없습니다.');
        }

        // 오디오 타입 확인
        if (!file.type.startsWith('audio/')) {
            throw new Error('음성 파일만 업로드 가능합니다.');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const path = `audio/${userId}/${fileName}`;
        
        return this.uploadFile(file, path, onProgress);
    }

    // 문서 파일 업로드
    static async uploadDocument(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        // 파일 크기 확인 (20MB 제한)
        if (file.size > 20 * 1024 * 1024) {
            throw new Error('문서 파일 크기는 20MB를 초과할 수 없습니다.');
        }

        // 문서 타입 확인
        const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('PDF, DOC, DOCX, TXT 파일만 업로드 가능합니다.');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const path = `documents/${userId}/${fileName}`;
        
        return this.uploadFile(file, path, onProgress);
    }

    // 파일 삭제
    static async deleteFile(url: string): Promise<void> {
        try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
        } catch (error) {
            console.error('File delete error:', error);
            throw new Error('파일 삭제에 실패했습니다.');
        }
    }

    // 파일 타입에 따른 업로드 함수 선택
    static async uploadByType(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<string> {
        if (file.type.startsWith('image/')) {
            return this.uploadImage(file, userId, onProgress);
        } else if (file.type.startsWith('video/')) {
            return this.uploadVideo(file, userId, onProgress);
        } else if (file.type.startsWith('audio/')) {
            return this.uploadAudio(file, userId, onProgress);
        } else {
            return this.uploadDocument(file, userId, onProgress);
        }
    }

    // 로컬 저장된 파일 데이터 가져오기
    static getLocalFileData(url: string): string | null {
        // Data URL이면 그대로 반환
        if (url.startsWith('data:')) {
            return url;
        }
        
        // Local storage URL 처리
        if (url.startsWith('local://')) {
            const fileId = url.replace('local://', '');
            const fileData = localStorage.getItem(fileId);
            
            if (fileData) {
                try {
                    const parsed = JSON.parse(fileData);
                    return parsed.data; // Base64 데이터 URL 반환
                } catch (error) {
                    console.error('로컬 파일 데이터 파싱 실패:', error);
                    return null;
                }
            }
        }
        
        // Blob URL은 null 반환 (오류 방지)
        if (url.startsWith('blob:')) {
            // 개발 환경에서만 한 번만 경고 표시
            if (import.meta.env.DEV && !sessionStorage.getItem('blob-warning-shown')) {
                console.warn('기존 Blob URL 파일들이 감지되었습니다. "정리" 버튼을 클릭하여 제거하세요.');
                sessionStorage.setItem('blob-warning-shown', 'true');
            }
            return null;
        }
        
        // 일반 URL은 그대로 반환
        return url;
    }
}