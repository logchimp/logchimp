<template>
  <div class="container">
    <div>
      <router-view />
    </div>
  </div>
</template>

<style lang='scss'>
.onboarding {
	max-width: 600px;
	width: 100%;
	margin-top: 4rem;
	margin-bottom: 4rem;
	margin-left: auto;
	margin-right: auto;
}

.onboarding-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.onboarding-header {
	margin-bottom: 2rem;
}

.onboarding-heading {
	color: var(--color-text-black);
	font-weight: 400;
	text-align: center;
	margin-bottom: 0;

	span {
		font-weight: 600;
	}
}

.onboarding-label {
	color: var(--color-gray-60);
	text-align: center;
	line-height: 20px;
	margin-top: 1rem;
}
</style>
