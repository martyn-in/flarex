import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const evalPath = path.join(process.cwd(), 'data', 'model_evaluation.json');

    if (fs.existsSync(evalPath)) {
      const raw = fs.readFileSync(evalPath, 'utf-8');
      const data = JSON.parse(raw);

      return NextResponse.json({
        success: true,
        metrics: {
          version: data.version,
          modelName: data.model_name,
          lastTrainedDate: data.training_date,
          dataset: {
            name: 'FLAREX Ground-Truth Multi-Class Incident Dataset (NTRO Benchmark)',
            dateRange: 'Verified Real-World Field Benchmark',
            totalSamples: data.dataset_summary.total_incident_records,
            uniqueIncidents: data.dataset_summary.unique_incidents,
            trainSamples: data.dataset_summary.train_samples,
            holdoutTestSamples: data.dataset_summary.holdout_test_samples,
            classDistribution: data.dataset_summary.class_distribution,
            validationStrategy: data.dataset_summary.cross_validation_strategy,
          },
          leakageProtections: data.leakage_protections,
          modelComparison: data.model_comparison_table,
          overallMetrics: {
            accuracy: data.holdout_metrics.accuracy,
            macroF1: data.holdout_metrics.macro_f1,
            macroPrecision: data.holdout_metrics.macro_precision,
            macroRecall: data.holdout_metrics.macro_recall,
            weightedF1: data.holdout_metrics.weighted_f1,
          },
          industrialFireMetrics: data.holdout_metrics.industrial_fire,
          classMetrics: Object.entries(data.holdout_metrics.per_class).map(([cls, m]: [string, any]) => ({
            className: cls.replace(/_/g, ' ').toUpperCase(),
            precision: m.precision,
            recall: m.recall,
            f1: m.f1,
            support: m.support,
          })),
          confusionMatrix: data.holdout_metrics.confusion_matrix,
          topFeatures: data.top_features,
          knownLimitations: [
            'Heavy monsoonal cloud cover (>85%) attenuates VIIRS 375m MWIR channel (B4).',
            'Small crop burns below 5 MW may show intermittent detection depending on sensor nadir scan angle.',
            'Extreme flare temperatures (>1200K) can cause localized saturation on VIIRS sensor detectors.',
          ],
        },
      });
    }

    // Explicit state if no model artifact has been calculated
    return NextResponse.json({
      success: true,
      metrics: {
        version: 'FLAREX-StageB-Pending-Evaluation',
        status: 'Model evaluation not yet available',
        message: 'No trained model artifact has been compiled yet. Run scripts/train_stage_b_models.py to train models.',
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/model/metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve model metrics.' },
      { status: 500 }
    );
  }
}
