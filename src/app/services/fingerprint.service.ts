import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { HttpClient } from '@angular/common/http';
import { IFingerPrint } from '../pages/survey/survey.component';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private fingerprintSubject = new BehaviorSubject<string | null>(null);
  fingerprint$ = this.fingerprintSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
  ) {
    this.generateFingerprint();
  }

  public setFingerprint(anonymous: IFingerPrint): Observable<IFingerPrint> {
    return this.httpClient.post<IFingerPrint>('https://survey-server.albertmanjon.es/anonymous', {...anonymous});
  }

  private async generateFingerprint() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();

    const fingerprintData = {
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      touchSupport: this.getTouchSupport(),
      platform: navigator.platform || 'unknown',
      language: navigator.language || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      timezoneOffset: new Date().getTimezoneOffset(),
      fingerprint: result.visitorId
    };

    const uniqueId = this.hashCode(JSON.stringify(fingerprintData));
    this.fingerprintSubject.next(uniqueId);
  }

  private async getAudioFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();
      const gainNode = audioCtx.createGain();
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

      let fingerprint = '';
      scriptProcessor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0);
        fingerprint = data.reduce((acc, val) => acc + Math.abs(val), 0).toString();
        resolve(fingerprint);
      };

      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);
      oscillator.start(0);
    });
  }

  private getTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  }
}
