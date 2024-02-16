import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  initialize,
  Event,
  VariationValue,
  Result,
} from '@harnessio/ff-javascript-client-sdk';
import { UserDomainService } from './user-domain.service';

import { environment } from '../environments/environment.development';

const API_KEY = '65c472f7818a91109c83e281';

const context = {
  apiKey: '16bd0732-5f56-4cb7-8a45-554cee2cc8e7',
  identifier: 'key',
  name: 'key',
  type: 'Client',
  baseURL: 'https://config.ff.harness.io/api/1.0',
  eventUrl: 'https://events.ff.harness.io/api/1.0',
};

const HARNESS_API = {
  baseURL: 'https://app.harness.io/cf/admin',
  type: 'features',
  accountIdentifier: 'JIDDlhRcTD6T_YXDYOeW4A',
  orgIdentifier: 'default',
  projectIdentifier: 'default_project',
  X_API_KEY: environment.apiKey,
  environment: environment.type,
  project: 'default_project',
};

const httpOptions = {
  headers: new HttpHeaders().set('Content-Type', 'application/json'),
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private static featureFlags: Record<string, VariationValue>;

  constructor(
    private http: HttpClient,
    private userDomainService: UserDomainService
  ) {}

  initializeClient(): Promise<any> {
    const cf = initialize(
      context.apiKey,
      { identifier: context.identifier, attributes: {} },
      { baseUrl: context.baseURL, eventUrl: context.eventUrl }
    );
    // this.clientFeature = cf;
    const featurePromise = new Promise((resolve, reject) => {
      cf.on(Event.READY, (flags: Record<string, VariationValue>) => {
        resolve(flags);
        AppConfigService.featureFlags = flags;
      });
    });
    return featurePromise;
  }

  setFeaturesFlag(features: any) {
    AppConfigService.featureFlags = features;
  }

  getFeatures(): any {
    return AppConfigService.featureFlags;
  }

  static getFeatureAttribute(key: string) {
    console.log(AppConfigService.featureFlags[key]);
    return AppConfigService.featureFlags[key];
  }

  isDomainFeatured(): boolean {
    const ffDomain = JSON.parse(
      AppConfigService.getFeatureAttribute('ff_domain') as string
    );
    return ffDomain.includes(this.userDomainService.getUserDomain());
  }

  isAccessible(): boolean {
    const ffConfig = JSON.parse(
      AppConfigService.getFeatureAttribute('ff_config') as string
    );
    const role = this.userDomainService.getUserRole();
    let isValidAdmin = false;
    for (let key of ffConfig) {
      if (key[role]) {
        isValidAdmin = key[role];
        break;
      }
    }
    return this.isDomainFeatured() && isValidAdmin;
  }

  isAdminRole(): boolean {
    return this.userDomainService.getUserRole() === 'admin';
  }

  public validateUser(): boolean {
    return this.isDomainFeatured() && this.isAccessible();
  }

  getFeatureFlagDetails(): Observable<any> {
    const URL: string = 'http://localhost:3000/express/api/harness/getFeatures';
    const payload = {
      baseURL: HARNESS_API.baseURL,
      type: HARNESS_API.type,
      accountIdentifier: HARNESS_API.accountIdentifier,
      orgIdentifier: HARNESS_API.orgIdentifier,
      projectIdentifier: HARNESS_API.projectIdentifier,
      apiKey: HARNESS_API.X_API_KEY,
    };
    return this.http.post(URL, payload, httpOptions);
  }

  updateFeatureFlagByKey(key: string, extras: any): Observable<any> {
    const URL: string =
      'http://localhost:3000/express/api/harness/updateFeature';
    const payload = {
      baseURL: HARNESS_API.baseURL,
      type: HARNESS_API.type,
      identifier: key,
      accountIdentifier: HARNESS_API.accountIdentifier,
      orgIdentifier: HARNESS_API.orgIdentifier,
      projectIdentifier: HARNESS_API.projectIdentifier,
      environmentIdentifier: HARNESS_API.environment,
      apiKey: HARNESS_API.X_API_KEY,
      payload: extras,
    };
    return this.http.post(URL, payload, httpOptions);
  }
}
