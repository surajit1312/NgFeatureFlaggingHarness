import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppConfigService } from '../app-config.service';

export interface IFeature {
  key: string;
  defaultValue: boolean;
  rules: Array<any>;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
  featureFlags!: Record<string, any>;
  panelOpenState = false;
  features: Array<any> = [];
  json = JSON.stringify;

  constructor(
    private appConfig: AppConfigService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.appConfig.getFeatureFlagDetails().subscribe((featureFlags) => {
      this.features = featureFlags.features.map((item: any) => {
        return {
          key: item.identifier,
          name: item.name,
          kind: item.kind,
          rules: {
            variations: item.variations,
          },
          defaultValue: item.envProperties.state === 'on',
        };
      });
    });
  }

  private getEnvironmentValues(environments: any) {
    console.log(environments);
    const envData = [];
    for (let key of Object.keys(environments)) {
      envData.push({
        key,
        name: environments[key]._environmentName,
        kind: environments[key].on,
      });
    }
    return envData;
  }

  toggleFeature(event: any, feature: any) {
    const checked = event.checked ? 'on' : 'off';
    const status = event.checked ? 'On' : 'Off';
    const payload = {
      instructions: [
        {
          kind: 'setFeatureFlagState',
          parameters: {
            state: checked,
          },
        },
      ],
    };
    this.appConfig
      .updateFeatureFlagByKey(feature.key, payload)
      .subscribe((val: any) => {
        if (val) {
          this._snackBar.open(
            `'${feature.key}' has been toggled successfully to '${status}'`,
            '',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            }
          );
        }
      });
  }
}
