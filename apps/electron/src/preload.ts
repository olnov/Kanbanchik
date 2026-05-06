import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('kanbanchik', {});
