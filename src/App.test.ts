import { describe, it, expect } from 'vitest';
import { missingInfo } from './utils/draft';

describe('missingInfo',()=>{it('flags required fields',()=>{const result = missingInfo({crNumber:'',crTitle:'',assetNumber:'',componentDescription:'',location:'',problemStatement:'bad',discoveredCondition:'',requestedAction:'bad',discipline:'Generic',workType:'Generic Work',priority:'Normal',safetySignificance:false,requiresClearance:true,requiresEngineeringInput:true,requiresParts:true,requiresScaffoldOrLift:false,notes:''}); expect(result.length).toBeGreaterThan(5);});});
