'use strict';

const { requireValue } = require('./common');

function selectUnresolvedCoverageRows(matrix) {
  requireValue(Array.isArray(matrix?.activeProductApprovalRegister), 'COVERAGE_MATRIX_REQUIRED', 'Coverage matrix register is required');
  return matrix.activeProductApprovalRegister.filter((row) =>
    row.shopifyStatus === 'ACTIVE' && row.coverageProposal?.disposition === 'HUMAN_REVIEW_REQUIRED');
}

function validateCoverageProjectionAgainstMatrix(projection, matrix) {
  const sourceRows = selectUnresolvedCoverageRows(matrix);
  requireValue(sourceRows.length === 31, 'SOURCE_COVERAGE_COUNT_CHANGED', 'The current matrix must contain exactly 31 unresolved Active Products');
  requireValue(Array.isArray(projection?.records) && projection.records.length === 31, 'COVERAGE_PROJECTION_COUNT_INVALID', 'Coverage review projection must contain exactly 31 rows');
  const productGids = projection.records.map((row) => row.productGid);
  requireValue(new Set(productGids).size === 31, 'DUPLICATE_PROJECTED_PRODUCT_GID', 'Coverage review projection contains a duplicate Product GID');
  const sourceByGid = new Map(sourceRows.map((row) => [row.productGid, row]));
  for (const row of projection.records) {
    const source = sourceByGid.get(row.productGid);
    requireValue(source, 'PROJECTED_PRODUCT_GID_NOT_IN_SOURCE', 'Coverage review projection contains an unknown or modified Product GID');
    requireValue(JSON.stringify(row.variantGids) === JSON.stringify(source.variantGids), 'PROJECTED_VARIANT_GIDS_MISMATCH', 'Projected Variant GIDs do not match their Product');
    requireValue(row.title === source.title && row.reviewPriority === source.reviewPriority, 'PROJECTED_SOURCE_FACTS_MISMATCH', 'Projected review facts no longer match the current matrix');
    requireValue(row.sourceBusinessApprovalStatus === source.businessApproval.status, 'EXISTING_APPROVAL_ERASED', 'Projection does not preserve source business approval status');
    requireValue(row.legalApprovalStatus === source.legalApproval.status, 'EXISTING_APPROVAL_ERASED', 'Projection does not preserve source legal approval status');
    requireValue(row.customerPromiseAuthorized === false, 'CUSTOMER_COVERAGE_AUTHORITY_FORBIDDEN', 'Projection cannot authorize a customer coverage promise');
  }
  for (const source of sourceRows) requireValue(productGids.includes(source.productGid), 'SOURCE_PRODUCT_MISSING_FROM_PROJECTION', 'Coverage review projection omits a required Product GID');
  return { selectedProducts: 31, uniqueProducts: 31, customerPromiseAuthorizations: 0 };
}

module.exports = { selectUnresolvedCoverageRows, validateCoverageProjectionAgainstMatrix };
