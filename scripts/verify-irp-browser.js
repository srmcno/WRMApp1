// Browser regression tests. The workflow injects this only into a temporary copy.
// Test data is fictional and is never copied into either distributable.
(() => {
  const key = 'irp-ci-test-v4';
  window.IRP_CONFIG = { storageKey: key, legacyKeys: ['irp-ci-test-v3'] };
  window.confirm = () => true;
  const reload = localStorage.getItem('irp-ci-phase') === 'reload';
  if (!reload) {
    localStorage.removeItem(key);
    localStorage.setItem('irp-ci-test-v3', JSON.stringify({ fields: { providerName: 'Legacy CI fixture', completedByEmail: 'test@example.invalid', futureGrowth: 'Retain original narrative' }, checks: {}, step: 0 }));
  }
  window.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    const checks = [];
    function assert(name, passed) { if (!passed) throw new Error(name); checks.push(name); }
    function set(values) { Object.entries(values).forEach(([id, value]) => { document.getElementById(id).value = String(value); }); refreshAll(); }
    function near(a, b) { return Math.abs(a - b) < Math.max(1e-8, Math.abs(b) * 1e-8); }
    try {
      assert('v4 initialized', typeof calculateModel === 'function' && document.querySelector('#step0'));
      if (!reload) {
        assert('legacy save migrated', v('providerName') === 'Legacy CI fixture');
        assert('legacy narrative retained', v('futureGrowth') === 'Retain original narrative');
        assert('historical key not overwritten', JSON.parse(localStorage.getItem('irp-ci-test-v3')).fields.providerName === 'Legacy CI fixture');
        set({ providerName: 'CI TEST FIXTURE', completedByEmail: 'saved@example.invalid', planReviewDate: '2027-11-03' });
        addFacilityRow('CI station', 'CI location');
        addOpsRow('contacts', { role: 'Test', name: 'Fixture', phone: 'TEST ONLY', alternate: '' });
        document.getElementById('supplyDemandBalance').value = 'Keep this manually edited narrative';
        supplyDemandManual = true;
        assert('real browser localStorage save succeeds', saveProgress());
        localStorage.setItem('irp-ci-phase', 'reload');
        location.reload();
        return;
      }
      assert('real reload restores provider', v('providerName') === 'CI TEST FIXTURE');
      assert('email and date restored', v('completedByEmail') === 'saved@example.invalid' && v('planReviewDate') === '2027-11-03');
      assert('facilities restored', getFacilitiesList().some(r => r.name === 'CI station'));
      assert('contact rows restored', getOpsRows('contacts')[0].phone === 'TEST ONLY');
      assert('manual narrative restored', v('supplyDemandBalance') === 'Keep this manually edited narrative');
      const yr = new Date().getFullYear() - 1;
      set({ yr1_year: yr, yr1_produced: daysInYear(yr) * 1e6, baselineMode: 'latest', peakMode: 'measured', measuredPeakMGD: 1.8, growthProjectionYears: 10, demandGrowthPct: 10, growthMode: 'total', surfaceWaterGpm: 2000, operatingHours: 20, sourceLimitMGD: 3, distributionLimitMGD: 2.5, supplyStressPct: 10, usableStorageGal: 500000, reserveStorageGal: 100000, remainingSupplyMGD: 1 });
      const m = calculateModel();
      assert('day-normalized annual baseline', near(m.base, 1));
      assert('total growth', near(m.projected, 1.1));
      assert('projected peak', near(m.projectedPeak, 1.98));
      assert('bottleneck capacity', near(m.firmMGD, 2.4));
      assert('peak utilization', near(m.projectedUsed, 82.5));
      assert('reserve-adjusted storage', near(m.autonomy, 400000 / 1800000 * 24));
      assert('net drawdown', near(m.drawdown, 400000 / 980000 * 24));
      set({ growthMode: 'annual' }); assert('compound growth', near(calculateModel().projected, 1.1 ** 10)); set({ growthMode: 'total' });
      set({ sourceLimitMGD: '' }); assert('blank source is not zero', calculateModel().firmMGD === 2.4 && !calculateModel().allLimitsKnown);
      set({ sourceLimitMGD: '0' }); assert('zero source remains zero', calculateModel().firmMGD === 0); set({ sourceLimitMGD: 3 });
      draftTriggers(); assert('ordered activation/recovery examples', stageRuleErrors().length === 0);
      set({ scenarioDemand: 2.4, scenarioDays: 1 }); assert('highest inclusive stage', evaluateScenario().title.includes('Stage 6'));
      set({ scenarioDemand: 1.8, scenarioDays: 2 }); assert('duration respected', evaluateScenario().title === 'No configured demand criterion met');
      set({ scenarioDays: 3 }); assert('exact threshold boundary', evaluateScenario().title.includes('Stage 2'));
      document.getElementById('scenarioQuality').checked = true; assert('quality override', evaluateScenario().title === 'Immediate operational response'); document.getElementById('scenarioQuality').checked = false;
      set({ freezeStart: 'October', freezeEnd: 'April', freezeFocus: 'Local seasonal detail', summerEnd: 'October' });
      const campaigns = buildSeasonalOutreachCampaigns('Test'); assert('seasonal form values used', campaigns[0].period === 'October through April' && campaigns[0].focus.includes('Local seasonal detail'));
      const backup = collectFormData(); validateBackup(JSON.parse(JSON.stringify(backup))); applyFormData(backup);
      assert('round trip manual narrative', v('supplyDemandBalance') === 'Keep this manually edited narrative');
      set({ providerName: '<img src=x onerror="alert(1)">', jurisdictionNotes: '<script>bad()<\/script>' });
      const doc = buildFullDocument();
      assert('user content escaped', doc.includes('&lt;img src=x') && !doc.includes('<script>bad()'));
      assert('complete document', doc.includes('12. References') && doc.includes('Stage 7') && doc.includes('Power / controls'));
      set({ planStatus: 'Adopted' }); let blocked = false; try { buildFullDocument(); } catch { blocked = true; } assert('incomplete adoption blocked', blocked); set({ planStatus: 'Draft' });
      document.querySelectorAll('.progress-step').forEach(b => goToStep(Number(b.dataset.step)));
      assert('all sections navigable', document.querySelectorAll('.section.active').length === 1);
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify({ savedAt: 'different-tab' }) }));
      assert('cross-tab conflict pauses autosave', storageConflict && !saveProgress());
      document.body.dataset.irpTest = 'passed';
      const result = document.createElement('pre'); result.id = 'testResult'; result.textContent = JSON.stringify({ passed: checks.length, checks }); document.body.appendChild(result);
      localStorage.removeItem('irp-ci-phase');
    } catch (error) {
      document.body.dataset.irpTest = 'failed';
      const result = document.createElement('pre'); result.id = 'testResult'; result.textContent = String(error.stack || error); document.body.appendChild(result);
    }
  }, 100));
})();
